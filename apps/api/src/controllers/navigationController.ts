// apps/api/src/controllers/navigationController.ts
import { Request, Response } from "express";
import { prisma } from "../prisma";

/** Normalizes a slug path so every segment is lowercase and alphanumeric-only. */
function normalizeSlug(slug: string): string {
  if (!slug) return "";
  return slug
    .split("/")
    .map((seg) =>
      seg.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    )
    .filter(Boolean)
    .join("/");
}

export interface NavItem     { title: string; slug: string; }
export interface NavCategory { category: string; slug: string; items: NavItem[]; }

export interface MenuTreePackage { id: string; title: string; slug: string; url: string; }
export interface MenuTreeLocation {
  title: string;
  slug: string;
  url: string;
  packages: MenuTreePackage[];
}
export interface MenuTreeCategory {
  category: string;
  slug: string;
  locations: MenuTreeLocation[];
}

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

    // Apply translations — translated title for display, canonical slug for URLs.
    // Slugs MUST stay canonical (English) so that:
    //   1. Language switching keeps the same URL path (only the lang prefix changes)
    //   2. getLocationBySlug can always resolve by canonical slug without translation lookup
    const resolved: { title: string; slug: string; category: string }[] =
      (locations as any[]).map(loc => {
        const t = loc.translations?.[0];
        return {
          title:    t?.title || loc.title,  // Translated for display in nav menus
          slug:     loc.slug,               // Always canonical English slug for URL routing
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
      grouped[loc.category].push({ title: loc.title, slug: normalizeSlug(loc.slug) });
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

/**
 * GET /api/v1/navigation/menu-tree
 *
 * Returns published content grouped as Category -> Location -> Package
 * for the admin menu builder picker only.
 */
export const getMenuTree = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [locations, packages] = await Promise.all([
      prisma.location.findMany({
        where: { isPublished: true },
        orderBy: { title: "asc" },
        select: { title: true, slug: true, category: true },
      }),
      prisma.package.findMany({
        where: { isPublished: true },
        orderBy: { title: "asc" },
        select: { id: true, title: true, slug: true, category: true, location: true },
      }),
    ]);

    const categoryOrder: string[] = [];
    const grouped: Record<string, MenuTreeLocation[]> = {};

    for (const loc of locations) {
      const locSlug = normalizeSlug(loc.slug);
      if (!grouped[loc.category]) {
        grouped[loc.category] = [];
        categoryOrder.push(loc.category);
      }

      const locPackages: MenuTreePackage[] = packages
        .filter((pkg) => {
          const pkgSlug = normalizeSlug(pkg.slug);
          if (pkgSlug.startsWith(`${locSlug}/`)) return true;
          if (pkg.category === loc.category && pkg.location.toLowerCase() === loc.title.toLowerCase()) {
            return true;
          }
          return false;
        })
        .map((pkg) => {
          const pkgSlug = normalizeSlug(pkg.slug);
          return {
            id: pkg.id,
            title: pkg.title,
            slug: pkgSlug,
            url: `/${pkgSlug}`,
          };
        });

      grouped[loc.category].push({
        title: loc.title,
        slug: locSlug,
        url: `/${locSlug}`,
        packages: locPackages,
      });
    }

    const tree: MenuTreeCategory[] = categoryOrder.map((category) => ({
      category,
      slug: category.toLowerCase().replace(/\s+/g, "-"),
      locations: grouped[category] ?? [],
    }));

    res.status(200).json({ status: "success", data: tree });
  } catch (error: any) {
    console.error("[getMenuTree] error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch menu tree" });
  }
};
