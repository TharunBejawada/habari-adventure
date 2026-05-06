// apps/api/src/controllers/navigationController.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";

export interface NavItem     { title: string; slug: string; }
export interface NavCategory { category: string; slug: string; items: NavItem[]; }

/**
 * GET /api/v1/navigation[?lang=fr]
 *
 * Returns all published Locations grouped by category.
 * Used by the admin menu builder to list available categories/locations,
 * and by the public Header to auto-populate category dropdowns.
 *
 * Response:
 * { status: "success", data: [{ category, slug, items: [{ title, slug }] }] }
 */
export const getNavigation = async (req: Request, res: Response): Promise<void> => {
  try {
    const lang = ((req.query.lang as string) || "en").trim();

    const locations = await prisma.location.findMany({
      where:   { isPublished: true },
      orderBy: { title: "asc" },
      select: {
        title:    true,
        slug:     true,
        category: true,
        ...(lang !== "en" && {
          translations: {
            where:  { languageCode: lang },
            select: { title: true, slug: true },
          },
        }),
      },
    });

    // Apply translations
    const resolved: { title: string; slug: string; category: string }[] =
      (locations as any[]).map(loc => {
        const t = loc.translations?.[0];
        return {
          title:    t?.title    || loc.title,
          slug:     t?.slug     || loc.slug,
          category: loc.category,
        };
      });

    // Group by category, preserving first-appearance order
    const categoryOrder: string[]                  = [];
    const grouped:       Record<string, NavItem[]> = {};

    for (const loc of resolved) {
      if (!grouped[loc.category]) {
        grouped[loc.category] = [];
        categoryOrder.push(loc.category);
      }
      grouped[loc.category].push({ title: loc.title, slug: loc.slug });
    }

    const navData: NavCategory[] = categoryOrder.map(cat => ({
      category: cat,
      slug:     cat.toLowerCase().replace(/\s+/g, "-"),
      items:    grouped[cat],
    }));

    res.status(200).json({ status: "success", data: navData });
  } catch (error: any) {
    console.error("[getNavigation] error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch navigation data" });
  }
};
