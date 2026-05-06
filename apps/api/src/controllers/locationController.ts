import { Request, Response } from "express";
import { prisma } from "../prisma";

// ==========================================
// TRANSLATION HELPER
// ==========================================
const applyTranslationLocation = (record: any) => {
  if (record.translations && record.translations.length > 0) {
    const t = record.translations[0];
    if (t.title) record.title = t.title;
    if (t.slug) record.slug = t.slug;
    if (t.overviewText) record.overviewText = t.overviewText;
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
    // 1. Extract the raw slug (handles both wildcard routes [0] and standard routes)
    const rawSlug = req.params[0] || req.params.slug;
    const lang = req.query.lang as string;

    // Failsafe in case no slug is provided
    if (!rawSlug) {
      return res.status(400).json({ status: "error", message: "Location slug is required" });
    }

    // 2. Decode the slug to fix the Next.js double-encoding issue (e.g., %2520 -> " ")
    const safeSlug = decodeURIComponent(rawSlug as string);

    // 3. Use the fully decoded safeSlug in the Prisma query
    const whereClause = lang && lang !== 'en'
      ? { OR: [{ slug: safeSlug }, { translations: { some: { slug: safeSlug, languageCode: lang } } }] }
      : { slug: safeSlug };

    let location = await prisma.location.findFirst({ 
      where: whereClause,
      include: lang && lang !== 'en' ? {
        translations: { where: { languageCode: lang } }
      } : undefined
    });

    if (!location) {
        return res.status(404).json({ status: "error", message: "Location not found" });
    }

    // Apply your translation mapping utility
    location = applyTranslationLocation(location);
    
    res.status(200).json({ status: "success", data: location });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const createLocation = async (req: Request, res: Response) => {
  try {
    const { languageCode, ...dataToSave } = req.body;
    // req.body naturally includes category and heroImage now!
    const newLocation = await prisma.location.create({ data: dataToSave });
    res.status(201).json({ status: "success", data: newLocation });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { languageCode, ...data } = req.body;

    if (!languageCode || languageCode === 'en') {
      const updatedLocation = await prisma.location.update({
        where: { id: id as string },
        data: data // Naturally updates category and heroImage
      });
      return res.status(200).json({ status: "success", data: updatedLocation });
    } else {
      const upsertedTranslation = await prisma.locationTranslation.upsert({
        where: { locationId_languageCode: { locationId: id as string, languageCode } },
        update: { title: data.title, slug: data.slug, overviewText: data.overviewText },
        create: { locationId: id as string, languageCode, title: data.title, slug: data.slug, overviewText: data.overviewText }
      });
      return res.status(200).json({ status: "success", data: upsertedTranslation });
    }
  } catch (error: any) {
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