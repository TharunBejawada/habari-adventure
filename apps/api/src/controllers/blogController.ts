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
import { prisma } from "../prisma";

// ==========================================
// TRANSLATION HELPER
// ==========================================
const applyTranslationBlog = (record: any) => {
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
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch blogs" });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, content, authorName, ...rest } = req.body;
    
    const adminUser = (req as any).user;
    const adminIdentifier = adminUser?.id || adminUser?.email || "Unknown Admin";

    if (!title || !slug || !content || !authorName) {
      res.status(400).json({ status: "error", message: "Title, slug, content, and author are required" });
      return;
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
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to create blog post" });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { languageCode, ...updateData } = req.body; // NEW
    
    const adminUser = (req as any).user;
    const adminIdentifier = adminUser?.id || adminUser?.email || "Unknown Admin";

    if (!languageCode || languageCode === 'en') {
      // STANDARD ENGLISH UPDATE
      if (updateData.slug) {
        const existing = await prisma.blog.findFirst({
          where: { slug: updateData.slug, NOT: { id } }
        });
        if (existing) {
          res.status(400).json({ status: "error", message: "SEO Slug is already used" });
          return;
        }
      }

      const updatedBlog = await prisma.blog.update({
        where: { id },
        data: {
          ...updateData,
          modifiedBy: adminIdentifier
        },
      });
      res.status(200).json({ status: "success", data: updatedBlog });
      return;
    
    } else {
      // TRANSLATION UPSERT
      const upsertedTranslation = await prisma.blogTranslation.upsert({
        where: { blogId_languageCode: { blogId: id, languageCode } },
        update: {
          title: updateData.title, slug: updateData.slug, content: updateData.content, excerpt: updateData.excerpt,
          imageAltText: updateData.imageAltText, category: updateData.category, tags: updateData.tags,
          metaTitle: updateData.metaTitle, metaDescription: updateData.metaDescription, metaKeywords: updateData.metaKeywords,
          faqs: updateData.faqs, schemaMarkup: updateData.schemaMarkup
        },
        create: {
          blogId: id, languageCode,
          title: updateData.title, slug: updateData.slug, content: updateData.content, excerpt: updateData.excerpt,
          imageAltText: updateData.imageAltText, category: updateData.category, tags: updateData.tags,
          metaTitle: updateData.metaTitle, metaDescription: updateData.metaDescription, metaKeywords: updateData.metaKeywords,
          faqs: updateData.faqs, schemaMarkup: updateData.schemaMarkup
        }
      });
      
      // Update the modifiedBy tag on the main blog so we know someone edited a translation
      await prisma.blog.update({ where: { id }, data: { modifiedBy: adminIdentifier } });

      res.status(200).json({ status: "success", data: upsertedTranslation });
      return;
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to update blog post" });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.blog.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to delete blog post" });
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
    const idOrSlug = req.params.idOrSlug as string;
    const lang = req.query.lang as string; // NEW

    const whereClause = lang && lang !== 'en'
      ? { OR: [ { id: idOrSlug }, { slug: idOrSlug }, { translations: { some: { slug: idOrSlug, languageCode: lang } } } ] }
      : { OR: [ { id: idOrSlug }, { slug: idOrSlug } ] };

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
  } catch (error) {
    res.status(200).json({ status: "success", message: "Translation was already empty" });
  }
};