// apps/api/src/controllers/packageController.ts
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

// ==========================================
// INTERNAL HELPERS
// ==========================================

/**
 * Translate a Prisma error into a clean, frontend-safe message.
 * Never exposes raw stack traces or internal Prisma internals.
 */
function prismaErrorMessage(error: any): { status: number; message: string } {
  // Log the raw error server-side for debugging
  console.error("[packageController] Prisma error:", {
    code: error?.code,
    meta: error?.meta,
    message: error?.message?.slice(0, 500),
  });

  if (error instanceof Prisma.PrismaClientValidationError) {
    // Strip the verbose stack portion; keep only the first meaningful line
    const first = (error.message || "").split("\n").find((l: string) => l.trim().length > 0) || "Validation error";
    return { status: 400, message: `Validation error: ${first.trim()}` };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const fields = (error.meta?.target as string[] | undefined)?.join("`, `") ?? "unknown";
        return {
          status: 400,
          message: `Unique constraint failed on the fields: (\`${fields}\`)`,
        };
      }
      case "P2025":
        return { status: 404, message: "Record not found" };
      case "P2003":
        return { status: 400, message: "Related record not found (foreign key constraint)" };
      default:
        return { status: 400, message: `Database error (${error.code})` };
    }
  }

  return { status: 400, message: error?.message ?? "An unexpected error occurred" };
}

/**
 * Normalizes a slug path so every segment is lowercase and alphanumeric-only.
 * Mirrors the frontend toSlug / normalizeSlugPath utilities.
 *
 * Examples:
 *   "Gorilla Hike/3-days-trek" → "gorilla-hike/3-days-trek"
 *   "Safari/Safaris/day-1"     → "safari/safaris/day-1"
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

/**
 * Strip fields that are not part of the Package schema before sending to Prisma.
 * Prevents PrismaClientValidationError from unknown argument fields.
 *
 * Fields stripped:
 * - languageCode  — routing metadata, not a Package column
 * - id            — auto-generated on create; must not be overwritten on update
 */
function sanitizePackageData(body: Record<string, any>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { languageCode, id, ...rest } = body;

  // Coerce structuredData: if a non-null string arrived (shouldn't happen given frontend
  // pre-parsing, but defensive), attempt to parse it; otherwise keep as-is or null it out.
  if (typeof rest.structuredData === "string") {
    if (rest.structuredData.trim() === "") {
      rest.structuredData = null;
    } else {
      try {
        rest.structuredData = JSON.parse(rest.structuredData);
      } catch {
        rest.structuredData = null;
      }
    }
  }

  return rest;
}

// ==========================================
// TRANSLATION HELPER
// ==========================================

const applyTranslation = (record: any) => {
  // Preserve canonical (English) values before any translation overwrites them.
  // These stable identifiers are safe to use for internal relations.
  record.canonicalTitle = record.title;
  record.canonicalSlug  = record.slug;

  if (record.translations && record.translations.length > 0) {
    const translation = record.translations[0];

    if (translation.title) record.title = translation.title;
    if (translation.slug) record.slug = translation.slug;
    if (translation.description) record.description = translation.description;
    if (translation.badgeText) record.badgeText = translation.badgeText;
    if (translation.quickFacts) record.quickFacts = translation.quickFacts;
    if (translation.whyChoose) record.whyChoose = translation.whyChoose;
    if (translation.itineraryMeta) record.itineraryMeta = translation.itineraryMeta;
    if (translation.itineraries) record.itineraries = translation.itineraries;
    if (translation.metaTitle) record.metaTitle = translation.metaTitle;
    if (translation.metaDescription) record.metaDescription = translation.metaDescription;
    if (translation.metaKeywords) record.metaKeywords = translation.metaKeywords;
    // Extended SEO fields (canonicalUrl, og*, twitter*, robots, structuredData) are global —
    // not per-language — so they are NOT merged from translation records.
  }

  delete record.translations;
  return record;
};

// ==========================================
// CONTROLLERS
// ==========================================

export const createPackage = async (req: Request, res: Response) => {
  try {
    const data = sanitizePackageData(req.body);

    // Normalize slug so spaces/mixed-case never enter the database
    if (data.slug) {
      data.slug = normalizeSlug(data.slug);
    }

    const newPackage = await prisma.package.create({ data: data as any });
    res.status(201).json({ status: "success", data: newPackage });
  } catch (error: any) {
    const { status, message } = prismaErrorMessage(error);
    res.status(status).json({ status: "error", message });
  }
};

export const getPackages = async (req: Request, res: Response) => {
  try {
    const { publishedOnly, category } = req.query;
    const lang = req.query.lang as string;
    const whereClause: any = {};

    if (publishedOnly === "true") whereClause.isPublished = true;
    if (category) whereClause.category = category;

    let packages = await prisma.package.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        location: true,
        isPublished: true,
        bannerImage: true,
        createdAt: true,
        translations:
          lang && lang !== "en" ? { where: { languageCode: lang } } : false,
      },
    });

    packages = packages.map((pkg) => applyTranslation(pkg));

    res.status(200).json({ status: "success", data: packages });
  } catch (error: any) {
    console.error("[getPackages] Error:", error?.message);
    res.status(500).json({ status: "error", message: "Failed to retrieve packages" });
  }
};

export const getPackageBySlug = async (req: Request, res: Response) => {
  try {
    const rawSlug = (req.params[0] || req.params.slug) as string;
    const slug = normalizeSlug(rawSlug);
    const lang = req.query.lang as string;

    // Try normalized slug first; also try raw slug so old bookmarks still work
    const slugFilters: string[] = [slug];
    if (rawSlug !== slug) slugFilters.push(rawSlug);

    const slugOr = slugFilters.map((s) => ({ slug: s }));
    const translationOr =
      lang && lang !== "en"
        ? slugFilters.map((s) => ({
            translations: { some: { slug: s, languageCode: lang } },
          }))
        : [];

    const whereClause =
      lang && lang !== "en"
        ? { OR: [...slugOr, ...translationOr] }
        : slugOr.length === 1
        ? slugOr[0]
        : { OR: slugOr };

    let pkg = await prisma.package.findFirst({
      where: whereClause,
      include:
        lang && lang !== "en"
          ? { translations: { where: { languageCode: lang } } }
          : undefined,
    });

    if (!pkg)
      return res
        .status(404)
        .json({ status: "error", message: "Package not found" });

    pkg = applyTranslation(pkg);

    res.status(200).json({ status: "success", data: pkg });
  } catch (error: any) {
    console.error("[getPackageBySlug] Error:", error?.message);
    res.status(500).json({ status: "error", message: "Failed to retrieve package" });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idValue = Array.isArray(id) ? id[0] : id;

    // Extract languageCode for routing; strip id + languageCode from data sent to Prisma
    const { languageCode, ...rawData } = req.body;
    const data = sanitizePackageData(rawData); // strips id, coerces structuredData

    if (!languageCode || languageCode === "en") {
      // Normalize slug on every English save
      if (data.slug) {
        data.slug = normalizeSlug(data.slug);
      }
      // ENGLISH UPDATE — update the main Package record
      const updatedPackage = await prisma.package.update({
        where: { id: idValue },
        data,
      });
      return res.status(200).json({ status: "success", data: updatedPackage });
    } else {
      // TRANSLATION UPSERT — only update translation-specific fields
      const upsertedTranslation = await prisma.packageTranslation.upsert({
        where: {
          packageId_languageCode: {
            packageId: idValue,
            languageCode: languageCode,
          },
        },
        update: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          badgeText: data.badgeText,
          quickFacts: data.quickFacts,
          whyChoose: data.whyChoose,
          itineraryMeta: data.itineraryMeta,
          itineraries: data.itineraries,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
        },
        create: {
          packageId: idValue,
          languageCode: languageCode,
          title: data.title,
          slug: data.slug,
          description: data.description,
          badgeText: data.badgeText,
          quickFacts: data.quickFacts,
          whyChoose: data.whyChoose,
          itineraryMeta: data.itineraryMeta,
          itineraries: data.itineraries,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
        },
      });
      return res
        .status(200)
        .json({ status: "success", data: upsertedTranslation });
    }
  } catch (error: any) {
    const { status, message } = prismaErrorMessage(error);
    res.status(status).json({ status: "error", message });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idValue = Array.isArray(id) ? id[0] : id;
    await prisma.package.delete({ where: { id: idValue } });
    res.status(200).json({ status: "success", message: "Package deleted successfully" });
  } catch (error: any) {
    const { status, message } = prismaErrorMessage(error);
    res.status(status).json({ status: "error", message });
  }
};

export const getPackagesByLocation = async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const locationStr = Array.isArray(location) ? location[0] : location;
    const lang = req.query.lang as string;

    // locationSlug is the canonical slug prefix (e.g. "climbing/kilimanjaro").
    // It provides a language-independent way to match packages by their slug path,
    // so this endpoint works correctly for French/Spanish/etc. pages where the
    // location title may be translated but the slug is always canonical.
    const locationSlugRaw = req.query.locationSlug as string | undefined;
    const locationSlug = locationSlugRaw ? normalizeSlug(decodeURIComponent(locationSlugRaw)) : "";

    // Build OR conditions: match by Package.location title (English), OR by slug prefix.
    const orConditions: any[] = [
      { location: { contains: locationStr, mode: "insensitive" } },
    ];
    if (locationSlug) {
      orConditions.push({ slug: { startsWith: `${locationSlug}/` } });
      // Also try normalized slug with hyphenated version in case title had spaces
      const slugWithoutPrefix = locationSlug.split("/").pop() || "";
      if (slugWithoutPrefix) {
        orConditions.push({ slug: { contains: `/${slugWithoutPrefix}/` } });
      }
    }

    let packages = await prisma.package.findMany({
      where: {
        isPublished: true,
        OR: orConditions,
      },
      orderBy: { createdAt: "desc" },
      include:
        lang && lang !== "en"
          ? { translations: { where: { languageCode: lang } } }
          : undefined,
    });

    packages = packages.map((pkg) => applyTranslation(pkg));

    res.status(200).json({ status: "success", data: packages });
  } catch (error: any) {
    console.error("[getPackagesByLocation] Error:", error?.message);
    res.status(500).json({ status: "error", message: "Failed to retrieve packages" });
  }
};

export const deletePackageTranslation = async (req: Request, res: Response) => {
  try {
    const { id, lang } = req.params;

    await prisma.packageTranslation.delete({
      where: {
        packageId_languageCode: {
          packageId: id as string,
          languageCode: lang as string,
        },
      },
    });

    res.status(200).json({ status: "success", message: "Translation deleted successfully" });
  } catch (error: any) {
    // P2025 = record not found — treat as success (idempotent delete)
    if (error?.code === "P2025") {
      return res.status(200).json({ status: "success", message: "Translation was already empty" });
    }
    const { status, message } = prismaErrorMessage(error);
    res.status(status).json({ status: "error", message });
  }
};
