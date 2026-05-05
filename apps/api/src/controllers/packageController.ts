// // apps/api/src/controllers/packageController.ts
// import { Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export const createPackage = async (req: Request, res: Response) => {
//   try {
//     const data = req.body;
//     const newPackage = await prisma.package.create({ data });
//     res.status(201).json({ status: "success", data: newPackage });
//   } catch (error: any) {
//     res.status(400).json({ status: "error", message: error.message });
//   }
// };

// export const getPackages = async (req: Request, res: Response) => {
//   try {
//     const { publishedOnly, category } = req.query;
//     const whereClause: any = {};
    
//     if (publishedOnly === 'true') whereClause.isPublished = true;
//     if (category) whereClause.category = category;

//     const packages = await prisma.package.findMany({
//       where: whereClause,
//       orderBy: { createdAt: "desc" },
//       select: { id: true, title: true, slug: true, category: true, location: true, isPublished: true, bannerImage: true, createdAt: true }
//     });
//     res.status(200).json({ status: "success", data: packages });
//   } catch (error: any) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// export const getPackageBySlug = async (req: Request, res: Response) => {
//   try {
//     const { slug } = req.params;
//     const slugValue = Array.isArray(slug) ? slug[0] : slug;
//     const pkg = await prisma.package.findUnique({ where: { slug: slugValue } });
//     if (!pkg) return res.status(404).json({ status: "error", message: "Package not found" });
//     res.status(200).json({ status: "success", data: pkg });
//   } catch (error: any) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };

// export const updatePackage = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const idValue = Array.isArray(id) ? id[0] : id;
//     const data = req.body;
//     const updatedPackage = await prisma.package.update({
//       where: { id: idValue },
//       data
//     });
//     res.status(200).json({ status: "success", data: updatedPackage });
//   } catch (error: any) {
//     res.status(400).json({ status: "error", message: error.message });
//   }
// };

// export const deletePackage = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const idValue = Array.isArray(id) ? id[0] : id;
//     await prisma.package.delete({ where: { id: idValue } });
//     res.status(200).json({ status: "success", message: "Package deleted successfully" });
//   } catch (error: any) {
//     res.status(400).json({ status: "error", message: error.message });
//   }
// };

// export const getPackagesByLocation = async (req: Request, res: Response) => {
//   try {
//     const { location } = req.params;
//     const locationStr = Array.isArray(location) ? location[0] : location;

//     const packages = await prisma.package.findMany({
//       where: {
//         isPublished: true, // Only fetch published packages for the user facing UI
//         location: {
//           contains: locationStr,
//           mode: 'insensitive' // Safely handles "Mt. Kilimanjaro" vs "mt kilimanjaro"
//         }
//       },
//       orderBy: { createdAt: "desc" }
//     });

//     res.status(200).json({ status: "success", data: packages });
//   } catch (error: any) {
//     res.status(500).json({ status: "error", message: error.message });
//   }
// };
// apps/api/src/controllers/packageController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==========================================
// TRANSLATION HELPER FUNCTION
// ==========================================
const applyTranslation = (record: any) => {
  // If the backend fetched a translation, overwrite the English fields
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
  }
  
  // Clean up the translations array so the frontend doesn't even know it happened
  delete record.translations;
  return record;
};

// ==========================================
// CONTROLLERS
// ==========================================

export const createPackage = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newPackage = await prisma.package.create({ data });
    res.status(201).json({ status: "success", data: newPackage });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const getPackages = async (req: Request, res: Response) => {
  try {
    const { publishedOnly, category } = req.query;
    const lang = req.query.lang as string; // NEW: Grab language from query
    const whereClause: any = {};
    
    if (publishedOnly === 'true') whereClause.isPublished = true;
    if (category) whereClause.category = category;

    let packages = await prisma.package.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: { 
        id: true, title: true, slug: true, category: true, location: true, isPublished: true, bannerImage: true, createdAt: true,
        // NEW: Fetch translation only if language is provided and is not English
        translations: lang && lang !== 'en' ? { where: { languageCode: lang } } : false
      }
    });

    // NEW: Apply translations safely to the array
    packages = packages.map(pkg => applyTranslation(pkg));

    res.status(200).json({ status: "success", data: packages });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getPackageBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params[0] || req.params.slug;
    const lang = req.query.lang as string;

    // ... The rest of your database fetch logic remains EXACTLY the same!
    const whereClause = lang && lang !== 'en'
      ? { OR: [{ slug: slug as string }, { translations: { some: { slug: slug as string, languageCode: lang } } }] }
      : { slug: slug as string };

    // Switched to findFirst to allow OR logic
    let pkg = await prisma.package.findFirst({ 
      where: whereClause,
      include: lang && lang !== 'en' ? {
        translations: { where: { languageCode: lang } }
      } : undefined
    });

    if (!pkg) return res.status(404).json({ status: "error", message: "Package not found" });

    // NEW: Overwrite with translated text
    pkg = applyTranslation(pkg);

    res.status(200).json({ status: "success", data: pkg });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updatePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idValue = Array.isArray(id) ? id[0] : id;
    
    // NEW: Extract languageCode from the body payload
    const { languageCode, ...data } = req.body;

    if (!languageCode || languageCode === 'en') {
      // STANDARD ENGLISH UPDATE
      const updatedPackage = await prisma.package.update({
        where: { id: idValue },
        data
      });
      return res.status(200).json({ status: "success", data: updatedPackage });
    
    } else {
      // NEW: TRANSLATION UPSERT (French/Spanish etc)
      // Only updates translation-specific fields, ignores global fields like 'location' or 'bannerImage'
      const upsertedTranslation = await prisma.packageTranslation.upsert({
        where: {
          packageId_languageCode: { packageId: idValue, languageCode: languageCode }
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
        }
      });
      return res.status(200).json({ status: "success", data: upsertedTranslation });
    }
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const deletePackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const idValue = Array.isArray(id) ? id[0] : id;
    await prisma.package.delete({ where: { id: idValue } });
    res.status(200).json({ status: "success", message: "Package deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const getPackagesByLocation = async (req: Request, res: Response) => {
  try {
    const { location } = req.params;
    const locationStr = Array.isArray(location) ? location[0] : location;
    const lang = req.query.lang as string; // NEW

    let packages = await prisma.package.findMany({
      where: {
        isPublished: true,
        location: {
          contains: locationStr,
          mode: 'insensitive' 
        }
      },
      orderBy: { createdAt: "desc" },
      // NEW: Fetch translations
      include: lang && lang !== 'en' ? {
        translations: { where: { languageCode: lang } }
      } : undefined
    });

    // NEW: Apply translations safely to the array
    packages = packages.map(pkg => applyTranslation(pkg));

    res.status(200).json({ status: "success", data: packages });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const deletePackageTranslation = async (req: Request, res: Response) => {
  try {
    const { id, lang } = req.params;
    
    await prisma.packageTranslation.delete({
      where: {
        packageId_languageCode: { packageId: id as string, languageCode: lang as string }
      }
    });
    
    res.status(200).json({ status: "success", message: "Translation deleted successfully" });
  } catch (error: any) {
    // If the record doesn't exist, Prisma throws an error. We can safely ignore it.
    res.status(200).json({ status: "success", message: "Translation was already empty" });
  }
};