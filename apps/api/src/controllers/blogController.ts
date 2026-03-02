// apps/api/src/controllers/blogController.ts
import { Request, Response } from "express";
// import { prisma } from "@repo/database";
import { prisma } from "../prisma";

// @route   GET /api/v1/blogs
// @desc    Get all blogs (Admin sees all, Public sees only published)
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publishedOnly } = req.query;
    const filter = publishedOnly === 'true' ? { isPublished: true } : {};

    const blogs = await prisma.blog.findMany({
      where: filter,
      orderBy: { createdAt: "desc" },
      select: { // Exclude massive RTE content from the list view for speed
        id: true, title: true, slug: true, excerpt: true, 
        featuredImage: true, authorName: true, category: true, 
        isPublished: true, publishedAt: true, readingTime: true
      }
    });
    res.status(200).json({ status: "success", data: blogs });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch blogs" });
  }
};

// @route   GET /api/v1/blogs/:idOrSlug
// @desc    Get single blog by ID or exact SEO Slug
export const getBlogByIdOrSlug = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { idOrSlug } = req.params;
    const idOrSlug = req.params.idOrSlug as string;
    
    const blog = await prisma.blog.findFirst({
      where: {
        OR: [ { id: idOrSlug }, { slug: idOrSlug } ]
      }
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

// @route   POST /api/v1/blogs
// @desc    Create a new blog post
export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, content, authorName, ...rest } = req.body;

    if (!title || !slug || !content || !authorName) {
      res.status(400).json({ status: "error", message: "Title, slug, content, and author are required" });
      return;
    }

    // Check if slug is unique
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ status: "error", message: "SEO Slug must be unique" });
      return;
    }

    const newBlog = await prisma.blog.create({
      data: { title, slug, content, authorName, ...rest }
    });

    res.status(201).json({ status: "success", data: newBlog });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to create blog post" });
  }
};

// @route   PUT /api/v1/blogs/:id
// @desc    Update a blog post
export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { id } = req.params;
    const id = req.params.id as string;
    const updateData = req.body;

    // Prevent unique constraint errors if they didn't actually change the slug
    if (updateData.slug) {
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
      data: updateData,
    });

    res.status(200).json({ status: "success", data: updatedBlog });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to update blog post" });
  }
};

// @route   DELETE /api/v1/blogs/:id
// @desc    Delete a blog post
export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    // const { id } = req.params;
    const id = req.params.id as string;
    await prisma.blog.delete({ where: { id } });
    res.status(200).json({ status: "success", message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to delete blog post" });
  }
};