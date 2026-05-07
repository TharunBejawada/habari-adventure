import { Request, Response } from "express";
import { prisma } from "../prisma";

// ==========================================
// SLUG NORMALIZATION
// ==========================================

/**
 * Normalizes a slug path into a URL-safe, SEO-friendly string.
 * Each path segment is lowercased and any non-alphanumeric run is collapsed
 * to a single hyphen. Leading/trailing hyphens are stripped per segment.
 *
 * Examples:
 *   "Gorilla Hike"          → "gorilla-hike"
 *   "destinations/Mt. Meru" → "destinations/mt-meru"
 *   "Safari/Safaris"        → "safari/safaris"
 */
function normalizeSlug(slug: string): string {
  if (!slug) return "";
  return slug
    .split("/")
    .map((seg) =>
      seg
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    )
    .filter(Boolean)
    .join("/");
}

// ==========================================
// TRANSLATION HELPER
// ==========================================
const applyTranslationLocation = (record: any) => {
  // Preserve canonical (English) values BEFORE any translation overwrites them.
  // These are used for stable internal relations that must never depend on translated text.
  record.canonicalTitle = record.title;
  record.canonicalSlug  = record.slug;

  if (record.translations && record.translations.length > 0) {
    const t = record.translations[0];
    if (t.title) record.title = t.title;
    if (t.slug) record.slug = t.slug;
    if (t.overviewText) record.overviewText = t.overviewText;
    // Apply localized SEO if present in translation
    if (t.metaTitle) record.metaTitle = t.metaTitle;
    if (t.metaDescription) record.metaDescription = t.metaDescription;
    if (t.metaKeywords) record.metaKeywords = t.metaKeywords;
  }
  delete record.translations;
  return record;
};

export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const lang = req.query.lang as string;

    let locations = await prisma.location.findMany({ 
      orderBy: { createdAt: 'desc' },
      include: lang && lang !== 'en' ? {
        translations: { where: { languageCode: lang } }
      } : undefined
    });

    locations = locations.map(applyTranslationLocation);
    res.status(200).json({ status: "success", data: locations });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getLocationBySlug = async (req: Request, res: Response) => {
  try {
    const rawSlug = (req.params[0] || req.params.slug) as string;
    const slug = normalizeSlug(rawSlug); // normalize so old URLs with spaces still resolve
    const lang = req.query.lang as string;

    // Build slug filters: try the normalized slug; if normalization changed it,
    // also try the raw slug so old bookmarks/links still work.
    const slugFilters: string[] = [slug];
    if (rawSlug !== slug) slugFilters.push(rawSlug);

    const slugOr = slugFilters.map((s) => ({ slug: s }));
    const translationOr = lang && lang !== "en"
      ? slugFilters.map((s) => ({ translations: { some: { slug: s, languageCode: lang } } }))
      : [];

    const whereClause = lang && lang !== "en"
      ? { OR: [...slugOr, ...translationOr] }
      : { OR: slugOr };

    let location = await prisma.location.findFirst({
      where: whereClause,
      include: lang && lang !== "en"
        ? { translations: { where: { languageCode: lang } } }
        : undefined,
    });

    if (!location) {
        return res.status(404).json({ status: "error", message: "Location not found" });
    }

    // Apply your translation mapping utility
    location = applyTranslationLocation(location);
    
    res.status(200).json({ status: "success", data: location });
  } catch (error: any) {
    console.error("[getLocationBySlug] error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to retrieve location" });
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const { languageCode, ...dataToSave } = req.body;
    // Always normalize slug on save — prevents spaces or mixed-case from entering the DB
    if (dataToSave.slug) {
      dataToSave.slug = normalizeSlug(dataToSave.slug);
    }
    const newLocation = await prisma.location.create({ data: dataToSave });
    res.status(201).json({ status: "success", data: newLocation });
  } catch (error: any) {
    console.error("[createLocation] error:", error.message);
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { languageCode, id: _id, ...data } = req.body;

    if (!languageCode || languageCode === "en") {
      // Normalize slug on every English save
      if (data.slug) {
        data.slug = normalizeSlug(data.slug);
      }
      const updatedLocation = await prisma.location.update({
        where: { id: id as string },
        data,
      });
      return res.status(200).json({ status: "success", data: updatedLocation });
    } else {
      // Normalize translation slug too
      const translationSlug = data.slug ? normalizeSlug(data.slug) : data.slug;
      const upsertedTranslation = await prisma.locationTranslation.upsert({
        where: { locationId_languageCode: { locationId: id as string, languageCode } },
        update: {
          title: data.title,
          slug: translationSlug,
          overviewText: data.overviewText,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
        },
        create: {
          locationId: id as string,
          languageCode,
          title: data.title,
          slug: translationSlug,
          overviewText: data.overviewText,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
        },
      });
      return res.status(200).json({ status: "success", data: upsertedTranslation });
    }
  } catch (error: any) {
    console.error("[updateLocation] error:", error.message);
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.location.delete({ where: { id: id as string } });
    res.status(200).json({ status: "success", message: "Location deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deleteLocationTranslation = async (req: Request, res: Response) => {
  try {
    const { id, lang } = req.params;
    await prisma.locationTranslation.delete({
      where: { locationId_languageCode: { locationId: id as string, languageCode: lang as string } }
    });
    res.status(200).json({ status: "success", message: "Translation deleted successfully" });
  } catch (error: any) {
    res.status(200).json({ status: "success", message: "Translation was already empty" });
  }
};

export const getLocationsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const lang = req.query.lang as string;

    let locations = await prisma.location.findMany({
      where: { category: category as string },
      orderBy: { createdAt: 'desc' },
      include: lang && lang !== 'en' ? {
        translations: { where: { languageCode: lang } }
      } : undefined
    });

    // Apply translations safely
    locations = locations.map(applyTranslationLocation);

    res.status(200).json({ status: "success", data: locations });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};