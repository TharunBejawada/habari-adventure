// // apps/api/src/controllers/blogController.ts
// import { Request, Response } from "express";
// import { prisma } from "../prisma";

// // ==========================================
// // 1. STANDARD CRUD OPERATIONS
// // ==========================================

// export const getBlogs = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { publishedOnly } = req.query;
//     const filter = publishedOnly === 'true' ? { isPublished: true } : {};

//     const blogs = await prisma.blog.findMany({
//       where: filter,
//       orderBy: { createdAt: "desc" },
//       select: {
//         id: true, title: true, slug: true, excerpt: true, 
//         featuredImage: true, authorName: true, category: true, 
//         tags: true, isPublished: true, publishedAt: true, readingTime: true
//       }
//     });
//     res.status(200).json({ status: "success", data: blogs });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to fetch blogs" });
//   }
// };

// export const createBlog = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { title, slug, content, authorName, ...rest } = req.body;
    
//     // Extract the admin's ID or Email from your auth middleware
//     // Assuming your requireAuth middleware attaches the decoded token to req.user
//     const adminUser = (req as any).user;
//     const adminIdentifier = adminUser?.id || adminUser?.email || "Unknown Admin";

//     if (!title || !slug || !content || !authorName) {
//       res.status(400).json({ status: "error", message: "Title, slug, content, and author are required" });
//       return;
//     }

//     const existing = await prisma.blog.findUnique({ where: { slug } });
//     if (existing) {
//       res.status(400).json({ status: "error", message: "SEO Slug must be unique" });
//       return;
//     }

//     const newBlog = await prisma.blog.create({
//       data: { 
//         title, slug, content, authorName, 
//         ...rest,
//         createdBy: adminIdentifier,
//         modifiedBy: adminIdentifier
//       }
//     });

//     res.status(201).json({ status: "success", data: newBlog });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to create blog post" });
//   }
// };

// export const updateBlog = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const id = req.params.id as string;
//     const updateData = req.body;
    
//     // Extract the admin's ID/Email to track who made the edit
//     const adminUser = (req as any).user;
//     const adminIdentifier = adminUser?.id || adminUser?.email || "Unknown Admin";

//     if (updateData.slug) {
//       const existing = await prisma.blog.findFirst({
//         where: { slug: updateData.slug, NOT: { id } }
//       });
//       if (existing) {
//         res.status(400).json({ status: "error", message: "SEO Slug is already used" });
//         return;
//       }
//     }

//     const updatedBlog = await prisma.blog.update({
//       where: { id },
//       data: {
//         ...updateData,
//         modifiedBy: adminIdentifier
//       },
//     });

//     res.status(200).json({ status: "success", data: updatedBlog });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to update blog post" });
//   }
// };

// export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const id = req.params.id as string;
//     await prisma.blog.delete({ where: { id } });
//     res.status(200).json({ status: "success", message: "Blog deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to delete blog post" });
//   }
// };


// // ==========================================
// // 2. SEARCH & FILTERING OPERATIONS
// // ==========================================

// // @route   GET /api/v1/blogs/search?q=keyword
// export const searchBlogs = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const keyword = req.query.q as string;
//     if (!keyword) {
//       res.status(400).json({ status: "error", message: "Search keyword is required" });
//       return;
//     }

//     const blogs = await prisma.blog.findMany({
//       where: {
//         isPublished: true,
//         OR: [
//           { title: { contains: keyword, mode: "insensitive" } },
//           { excerpt: { contains: keyword, mode: "insensitive" } },
//           { category: { contains: keyword, mode: "insensitive" } },
//           // Note: In Postgres, array searches usually require 'has' or similar exact checks,
//           // but checking title/excerpt/category covers 99% of search needs natively.
//         ]
//       },
//       orderBy: { publishedAt: "desc" }
//     });

//     res.status(200).json({ status: "success", data: blogs });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to search blogs" });
//   }
// };

// // @route   GET /api/v1/blogs/category/:category
// export const getBlogsByCategory = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const category = req.params.category as string;
//     const blogs = await prisma.blog.findMany({
//       where: { isPublished: true, category: { equals: category, mode: "insensitive" } },
//       orderBy: { publishedAt: "desc" }
//     });
//     res.status(200).json({ status: "success", data: blogs });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to fetch by category" });
//   }
// };

// // @route   GET /api/v1/blogs/tag/:tag
// export const getBlogsByTag = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const tag = req.params.tag as string;
//     const blogs = await prisma.blog.findMany({
//       where: { isPublished: true, tags: { has: tag } }, // 'has' works natively with Postgres String[]
//       orderBy: { publishedAt: "desc" }
//     });
//     res.status(200).json({ status: "success", data: blogs });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to fetch by tag" });
//   }
// };


// // ==========================================
// // 3. AGGREGATION / STATS OPERATIONS
// // ==========================================

// // @route   GET /api/v1/blogs/stats/top-categories
// export const getTopCategories = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Prisma natively supports grouping!
//     const categories = await prisma.blog.groupBy({
//       by: ['category'],
//       where: { isPublished: true, category: { not: null } },
//       _count: { category: true },
//       orderBy: { _count: { category: 'desc' } },
//       take: 6
//     });

//     const formatted = categories.map((c :any) => ({
//       category: c.category,
//       count: c._count.category
//     }));

//     res.status(200).json({ status: "success", data: formatted });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to fetch top categories" });
//   }
// };

// // @route   GET /api/v1/blogs/stats/top-tags
// export const getTopTags = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Prisma doesn't natively group arrays, so we fetch the arrays and count them in memory
//     const blogs = await prisma.blog.findMany({
//       where: { isPublished: true },
//       select: { tags: true }
//     });

//     const tagCounts: Record<string, number> = {};
//     blogs.forEach((blog: any) => {
//       blog.tags.forEach((tag: any) => {
//         tagCounts[tag] = (tagCounts[tag] || 0) + 1;
//       });
//     });

//     // Convert object to sorted array
//     const topTags = Object.entries(tagCounts)
//       .map(([tag, count]) => ({ tag, count }))
//       .sort((a, b) => b.count - a.count)
//       .slice(0, 10); // Return top 10

//     res.status(200).json({ status: "success", data: topTags });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to fetch top tags" });
//   }
// };

// // ==========================================
// // 4. GET BY ID / SLUG (MUST STAY AT BOTTOM)
// // ==========================================

// export const getBlogByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const idOrSlug = req.params.idOrSlug as string;
//     const blog = await prisma.blog.findFirst({
//       where: { OR: [ { id: idOrSlug }, { slug: idOrSlug } ] }
//     });

//     if (!blog) {
//       res.status(404).json({ status: "error", message: "Blog post not found" });
//       return;
//     }
//     res.status(200).json({ status: "success", data: blog });
//   } catch (error) {
//     res.status(500).json({ status: "error", message: "Failed to fetch blog post" });
//   }
// };
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

// ==========================================
// SLUG NORMALIZATION
// ==========================================

/**
 * Translate a Prisma error into a clean, frontend-safe message.
 */
function prismaErrorMessage(error: any): { status: number; message: string } {
  console.error("[blogController] Prisma error:", {
    code: error?.code,
    meta: error?.meta,
    message: error?.message?.slice(0, 500),
  });

  if (error instanceof Prisma.PrismaClientValidationError) {
    const first = (error.message || "").split("\n").find((l: string) => l.trim().length > 0) || "Validation error";
    return { status: 400, message: `Invalid blog data: ${first.trim()}` };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const fields = (error.meta?.target as string[] | undefined)?.join("`, `") ?? "slug";
        return { status: 400, message: `A blog with this slug already exists in this language (\`${fields}\`)` };
      }
      case "P2025":
        return { status: 404, message: "Blog post not found" };
      case "P2003":
        return { status: 400, message: "Related record not found (foreign key constraint)" };
      default:
        return { status: 400, message: `Database error (${error.code})` };
    }
  }

  return { status: 500, message: error?.message ?? "An unexpected error occurred" };
}

/**
 * Strips fields that are NOT part of the Blog schema before sending to Prisma.
 * Prevents PrismaClientValidationError from unknown argument fields.
 *
 * Blog schema fields (allowed): title, slug, content, excerpt, featuredImage,
 * imageAltText, authorName, category, tags, isPublished, publishedAt,
 * readingTime, metaTitle, metaDescription, metaKeywords, faqs, schemaMarkup,
 * createdBy, modifiedBy.
 *
 * Stripped: languageCode (routing metadata), id (auto-generated).
 */
const BLOG_SCHEMA_FIELDS = new Set([
  "title", "slug", "content", "excerpt", "featuredImage", "imageAltText",
  "authorName", "category", "tags", "isPublished", "publishedAt", "readingTime",
  "metaTitle", "metaDescription", "metaKeywords", "faqs", "schemaMarkup",
  "createdBy", "modifiedBy",
]);

function sanitizeBlogData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    if (BLOG_SCHEMA_FIELDS.has(key)) {
      sanitized[key] = data[key];
    }
  }
  // Coerce schemaMarkup: if a string arrived, parse or null it
  if (typeof sanitized.schemaMarkup === "string") {
    try {
      sanitized.schemaMarkup = sanitized.schemaMarkup ? JSON.parse(sanitized.schemaMarkup) : null;
    } catch {
      sanitized.schemaMarkup = null;
    }
  }
  return sanitized;
}

/** Normalizes a blog slug: lowercase, alphanumeric + hyphens, no spaces. */
function normalizeSlug(slug: string): string {
  if (!slug) return "";
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ==========================================
// TRANSLATION HELPER
// ==========================================
const applyTranslationBlog = (record: any) => {
  // Preserve canonical (English) values before any translation overwrites them.
  record.canonicalTitle = record.title;
  record.canonicalSlug  = record.slug;

  if (record.translations && record.translations.length > 0) {
    const t = record.translations[0];
    if (t.title) record.title = t.title;
    if (t.slug) record.slug = t.slug;
    if (t.content) record.content = t.content;
    if (t.excerpt !== undefined) record.excerpt = t.excerpt;
    if (t.imageAltText !== undefined) record.imageAltText = t.imageAltText;
    if (t.category !== undefined) record.category = t.category;
    if (t.tags && t.tags.length > 0) record.tags = t.tags;
    if (t.metaTitle !== undefined) record.metaTitle = t.metaTitle;
    if (t.metaDescription !== undefined) record.metaDescription = t.metaDescription;
    if (t.metaKeywords !== undefined) record.metaKeywords = t.metaKeywords;
    if (t.faqs !== undefined) record.faqs = t.faqs;
    if (t.schemaMarkup !== undefined) record.schemaMarkup = t.schemaMarkup;
  }
  delete record.translations;
  return record;
};

// ==========================================
// 1. STANDARD CRUD OPERATIONS
// ==========================================

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publishedOnly } = req.query;
    const lang = req.query.lang as string; // NEW
    const filter = publishedOnly === 'true' ? { isPublished: true } : {};

    let blogs = await prisma.blog.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true, 
        featuredImage: true, authorName: true, category: true, 
        tags: true, isPublished: true, publishedAt: true, readingTime: true,
        // NEW: Because you are using select, we add the translation inclusion here!
        translations: lang && lang !== 'en' ? { where: { languageCode: lang } } : false
      }
    });

    blogs = blogs.map(applyTranslationBlog);

    res.status(200).json({ status: "success", data: blogs });
  } catch (error: any) {
    console.error("[getBlogs] Error:", error?.message);
    res.status(500).json({ status: "error", message: "Failed to fetch blogs" });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    // Strip non-schema fields before any Prisma call:
    //   languageCode — routing metadata, not a Blog column
    //   id           — auto-generated; must not be passed on create
    //   slug (raw)   — we normalize it separately below
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { languageCode, id: _id, title, slug: _rawSlug, content, authorName, ...rest } = req.body;
    const slug = normalizeSlug(_rawSlug || "");

    const adminUser = (req as any).user;
    const adminIdentifier = adminUser?.id || adminUser?.email || "Unknown Admin";

    if (!title || !slug || !content || !authorName) {
      res.status(400).json({ status: "error", message: "Title, slug, content, and author are required" });
      return;
    }

    // Coerce schemaMarkup: if a string arrived, parse or null it out
    if (typeof rest.schemaMarkup === "string") {
      try {
        rest.schemaMarkup = rest.schemaMarkup ? JSON.parse(rest.schemaMarkup) : null;
      } catch {
        rest.schemaMarkup = null;
      }
    }

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ status: "error", message: "SEO Slug must be unique" });
      return;
    }

    const newBlog = await prisma.blog.create({
      data: {
        title, slug, content, authorName,
        ...rest,
        createdBy: adminIdentifier,
        modifiedBy: adminIdentifier
      }
    });

    res.status(201).json({ status: "success", data: newBlog });
  } catch (error: any) {
    console.error("[createBlog] error:", error?.message);
    if (error?.code === "P2002") {
      res.status(400).json({ status: "error", message: "SEO Slug must be unique" });
    } else if (error?.name === "PrismaClientValidationError") {
      const first = (error.message || "").split("\n").find((l: string) => l.trim().length > 0) || "Validation error";
      res.status(400).json({ status: "error", message: `Invalid blog data: ${first.trim()}` });
    } else {
      res.status(500).json({ status: "error", message: error?.message || "Failed to create blog post" });
    }
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { languageCode, ...rawUpdate } = req.body;

    const adminUser = (req as any).user;
    const adminIdentifier = adminUser?.id || adminUser?.email || "Unknown Admin";

    if (!languageCode || languageCode === 'en') {
      // ENGLISH UPDATE — strip non-schema fields, normalize slug
      const updateData = sanitizeBlogData(rawUpdate);

      if (updateData.slug) {
        updateData.slug = normalizeSlug(updateData.slug);
        // Verify slug uniqueness (exclude self)
        const existing = await prisma.blog.findFirst({
          where: { slug: updateData.slug, NOT: { id } }
        });
        if (existing) {
          res.status(400).json({ status: "error", message: "SEO Slug is already used by another post" });
          return;
        }
      }

      const updatedBlog = await prisma.blog.update({
        where: { id },
        data: { ...updateData, modifiedBy: adminIdentifier },
      });
      res.status(200).json({ status: "success", data: updatedBlog });
      return;

    } else {
      // TRANSLATION UPSERT — normalize slug, only update translation-specific fields
      let translationSlug = rawUpdate.slug ? normalizeSlug(rawUpdate.slug) : "";

      if (!translationSlug) {
        // If admin sent an empty slug, fall back to the parent blog's canonical English slug
        const parentBlog = await prisma.blog.findUnique({ where: { id }, select: { slug: true } });
        translationSlug = parentBlog?.slug || "";
      }

      if (!translationSlug) {
        res.status(400).json({ status: "error", message: "A URL slug is required for the translation" });
        return;
      }

      // Check localized slug uniqueness (must be unique per language across all blogs)
      const existingTranslation = await prisma.blogTranslation.findFirst({
        where: {
          languageCode,
          slug: translationSlug,
          NOT: { blogId: id },
        },
      });
      if (existingTranslation) {
        res.status(400).json({ status: "error", message: `Slug "${translationSlug}" is already used by another ${languageCode.toUpperCase()} translation` });
        return;
      }

      // Coerce schemaMarkup if it arrived as a string
      let schemaMarkup = rawUpdate.schemaMarkup;
      if (typeof schemaMarkup === "string") {
        try { schemaMarkup = schemaMarkup ? JSON.parse(schemaMarkup) : null; } catch { schemaMarkup = null; }
      }

      const translationFields = {
        title: rawUpdate.title,
        slug: translationSlug,
        content: rawUpdate.content,
        excerpt: rawUpdate.excerpt,
        imageAltText: rawUpdate.imageAltText,
        category: rawUpdate.category,
        tags: rawUpdate.tags,
        metaTitle: rawUpdate.metaTitle,
        metaDescription: rawUpdate.metaDescription,
        metaKeywords: rawUpdate.metaKeywords,
        faqs: rawUpdate.faqs,
        schemaMarkup,
      };

      const upsertedTranslation = await prisma.blogTranslation.upsert({
        where: { blogId_languageCode: { blogId: id, languageCode } },
        update: translationFields,
        create: { blogId: id, languageCode, ...translationFields },
      });

      // Track who edited the translation on the parent blog
      await prisma.blog.update({ where: { id }, data: { modifiedBy: adminIdentifier } });

      res.status(200).json({ status: "success", data: upsertedTranslation });
      return;
    }
  } catch (error: any) {
    const { status, message } = prismaErrorMessage(error);
    res.status(status).json({ status: "error", message });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.blog.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Blog deleted successfully" });
  } catch (error: any) {
    const { status, message } = prismaErrorMessage(error);
    res.status(status).json({ status: "error", message });
  }
};

// ==========================================
// 2. SEARCH & FILTERING OPERATIONS
// ==========================================

export const searchBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = req.query.q as string;
    const lang = req.query.lang as string; // NEW
    if (!keyword) {
      res.status(400).json({ status: "error", message: "Search keyword is required" });
      return;
    }

    let blogs = await prisma.blog.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { excerpt: { contains: keyword, mode: "insensitive" } },
          { category: { contains: keyword, mode: "insensitive" } },
          // FIX: Added 'as const' to prevent TypeScript from widening the string
          ...(lang && lang !== 'en' ? [{
            translations: { 
              some: { 
                languageCode: lang, 
                OR: [ 
                  { title: { contains: keyword, mode: "insensitive" as const } }, 
                  { excerpt: { contains: keyword, mode: "insensitive" as const } } 
                ] 
              } 
            }
          }] : [])
        ]
      },
      orderBy: { publishedAt: "desc" },
      include: lang && lang !== 'en' ? { translations: { where: { languageCode: lang } } } : undefined
    });

    blogs = blogs.map(applyTranslationBlog);

    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to search blogs" });
  }
};

export const getBlogsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.params.category as string;
    const lang = req.query.lang as string; // NEW

    let blogs = await prisma.blog.findMany({
      where: { isPublished: true, category: { equals: category, mode: "insensitive" } },
      orderBy: { publishedAt: "desc" },
      include: lang && lang !== 'en' ? { translations: { where: { languageCode: lang } } } : undefined
    });

    blogs = blogs.map(applyTranslationBlog);
    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch by category" });
  }
};

export const getBlogsByTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const tag = req.params.tag as string;
    const lang = req.query.lang as string; // NEW

    let blogs = await prisma.blog.findMany({
      where: { isPublished: true, tags: { has: tag } },
      orderBy: { publishedAt: "desc" },
      include: lang && lang !== 'en' ? { translations: { where: { languageCode: lang } } } : undefined
    });

    blogs = blogs.map(applyTranslationBlog);
    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch by tag" });
  }
};

// ==========================================
// 3. AGGREGATION / STATS OPERATIONS
// ==========================================
// Note: Aggregations map back to the universal English model data, so no translations needed here!
export const getTopCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.blog.groupBy({
      by: ['category'],
      where: { isPublished: true, category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 6
    });

    const formatted = categories.map((c :any) => ({
      category: c.category,
      count: c._count.category
    }));

    res.status(200).json({ status: "success", data: formatted });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch top categories" });
  }
};

export const getTopTags = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { tags: true }
    });

    const tagCounts: Record<string, number> = {};
    blogs.forEach((blog: any) => {
      blog.tags.forEach((tag: any) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.status(200).json({ status: "success", data: topTags });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch top tags" });
  }
};

// ==========================================
// 4. GET BY ID / SLUG
// ==========================================

export const getBlogByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawSlug = req.params.idOrSlug as string;
    const slug = normalizeSlug(rawSlug);
    const lang = req.query.lang as string;

    // Try both normalized and raw slug for backward compatibility with old records
    const slugOr: { slug: string }[] = [{ slug }];
    if (rawSlug !== slug) slugOr.push({ slug: rawSlug });

    const whereClause = lang && lang !== 'en'
      ? { OR: [ { id: rawSlug }, ...slugOr, { translations: { some: { slug, languageCode: lang } } }, ...(rawSlug !== slug ? [{ translations: { some: { slug: rawSlug, languageCode: lang } } }] : []) ] }
      : { OR: [ { id: rawSlug }, ...slugOr ] };

    let blog = await prisma.blog.findFirst({
      where: whereClause,
      include: lang && lang !== 'en' ? { translations: { where: { languageCode: lang } } } : undefined
    });

    if (!blog) {
      res.status(404).json({ status: "error", message: "Blog post not found" });
      return;
    }

    blog = applyTranslationBlog(blog);
    res.status(200).json({ status: "success", data: blog });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch blog post" });
  }
};

export const deleteBlogTranslation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, lang } = req.params;
    await prisma.blogTranslation.delete({
      where: { blogId_languageCode: { blogId: id as string, languageCode: lang as string } }
    });
    res.status(200).json({ status: "success", message: "Translation deleted successfully" });
  } catch (error: any) {
    // P2025 = record not found — treat as success (idempotent delete)
    if (error?.code === "P2025") {
      res.status(200).json({ status: "success", message: "Translation was already empty" });
      return;
    }
    const { status, message } = prismaErrorMessage(error);
    res.status(status).json({ status: "error", message });
  }
};