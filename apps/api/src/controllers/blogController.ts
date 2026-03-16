// apps/api/src/controllers/blogController.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";

// ==========================================
// 1. STANDARD CRUD OPERATIONS
// ==========================================

export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publishedOnly } = req.query;
    const filter = publishedOnly === 'true' ? { isPublished: true } : {};

    const blogs = await prisma.blog.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true, 
        featuredImage: true, authorName: true, category: true, 
        tags: true, isPublished: true, publishedAt: true, readingTime: true
      }
    });
    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch blogs" });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, content, authorName, ...rest } = req.body;
    
    // Extract the admin's ID or Email from your auth middleware
    // Assuming your requireAuth middleware attaches the decoded token to req.user
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
    const updateData = req.body;
    
    // Extract the admin's ID/Email to track who made the edit
    const adminUser = (req as any).user;
    const adminIdentifier = adminUser?.id || adminUser?.email || "Unknown Admin";

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

// @route   GET /api/v1/blogs/search?q=keyword
export const searchBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const keyword = req.query.q as string;
    if (!keyword) {
      res.status(400).json({ status: "error", message: "Search keyword is required" });
      return;
    }

    const blogs = await prisma.blog.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { excerpt: { contains: keyword, mode: "insensitive" } },
          { category: { contains: keyword, mode: "insensitive" } },
          // Note: In Postgres, array searches usually require 'has' or similar exact checks,
          // but checking title/excerpt/category covers 99% of search needs natively.
        ]
      },
      orderBy: { publishedAt: "desc" }
    });

    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to search blogs" });
  }
};

// @route   GET /api/v1/blogs/category/:category
export const getBlogsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.params.category as string;
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true, category: { equals: category, mode: "insensitive" } },
      orderBy: { publishedAt: "desc" }
    });
    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch by category" });
  }
};

// @route   GET /api/v1/blogs/tag/:tag
export const getBlogsByTag = async (req: Request, res: Response): Promise<void> => {
  try {
    const tag = req.params.tag as string;
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true, tags: { has: tag } }, // 'has' works natively with Postgres String[]
      orderBy: { publishedAt: "desc" }
    });
    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch by tag" });
  }
};


// ==========================================
// 3. AGGREGATION / STATS OPERATIONS
// ==========================================

// @route   GET /api/v1/blogs/stats/top-categories
export const getTopCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    // Prisma natively supports grouping!
    const categories = await prisma.blog.groupBy({
      by: ['category'],
      where: { isPublished: true, category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 6
    });

    const formatted = categories.map(c => ({
      category: c.category,
      count: c._count.category
    }));

    res.status(200).json({ status: "success", data: formatted });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch top categories" });
  }
};

// @route   GET /api/v1/blogs/stats/top-tags
export const getTopTags = async (req: Request, res: Response): Promise<void> => {
  try {
    // Prisma doesn't natively group arrays, so we fetch the arrays and count them in memory
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { tags: true }
    });

    const tagCounts: Record<string, number> = {};
    blogs.forEach(blog => {
      blog.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Convert object to sorted array
    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Return top 10

    res.status(200).json({ status: "success", data: topTags });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch top tags" });
  }
};

// ==========================================
// 4. GET BY ID / SLUG (MUST STAY AT BOTTOM)
// ==========================================

export const getBlogByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const idOrSlug = req.params.idOrSlug as string;
    const blog = await prisma.blog.findFirst({
      where: { OR: [ { id: idOrSlug }, { slug: idOrSlug } ] }
    });

    if (!blog) {
      res.status(404).json({ status: "error", message: "Blog post not found" });
      return;
    }
    res.status(200).json({ status: "success", data: blog });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch blog post" });
  }
};