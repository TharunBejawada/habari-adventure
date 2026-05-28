/**
 * Admin menu builder helpers.
 * Persists compatible NavConfigItem[] for the existing public Header renderer.
 */

export interface LinkItem {
  name: string;
  url: string;
}

export interface FooterColumn {
  title: string;
  links: LinkItem[];
}

export interface SubItemOverride {
  slug: string;
  title: string;
  url: string;
  hidden: boolean;
  itemType?: "location" | "package" | "custom";
  parentLocationSlug?: string;
}

export interface NavConfigItem {
  id: string;
  type: "category" | "custom";
  order: number;
  reference?: string;
  label?: string;
  autoPopulate?: boolean;
  subItemOverrides?: SubItemOverride[];
  name?: string;
  url?: string;
  subItems?: { id: string; name: string; url: string }[];
}

export interface MenuTreePackage {
  id: string;
  title: string;
  slug: string;
  url: string;
}

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

/** One row in the admin "Menu Structure" panel */
export interface StructureNode {
  key: string;
  type: "category" | "location" | "package" | "custom" | "custom-sub";
  label: string;
  depth: number;
  navItemId: string;
  slug?: string;
  url?: string;
  hidden?: boolean;
  reference?: string;
  /** Which NavConfigItem field to update */
  editTarget: "category" | "override" | "custom" | "custom-sub";
  overrideSlug?: string;
  subItemId?: string;
  overrideItemType?: SubItemOverride["itemType"];
}

export const genId = () => Math.random().toString(36).slice(2, 10);

export function parseJson<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      /* fall through */
    }
  }
  return fallback;
}

/** Convert old flat { name, url, subItems }[] to NavConfigItem[] */
export function migrateMenu(raw: unknown[]): NavConfigItem[] {
  return raw.map((item, i) => {
    const row = item as Record<string, unknown>;
    if (row.type === "category" || row.type === "custom") {
      return { ...row, order: (row.order as number) ?? i } as NavConfigItem;
    }
    return {
      id: (row.id as string) ?? genId(),
      type: "custom" as const,
      order: i,
      name: (row.name as string) ?? "",
      url: (row.url as string) ?? "",
      subItems: parseJson<{ id?: string; name: string; url: string }[]>(row.subItems, []).map(
        (s, si) => ({
          id: s.id ?? String(si),
          name: s.name ?? "",
          url: s.url ?? "",
        }),
      ),
    };
  });
}

export function reorder(items: NavConfigItem[]): NavConfigItem[] {
  return items.map((item, i) => ({ ...item, order: i }));
}

export function normalizeForSave(items: NavConfigItem[]): NavConfigItem[] {
  return reorder(
    items.map((item) => ({
      ...item,
      subItemOverrides: (item.subItemOverrides ?? []).map((o) => ({
        slug: o.slug,
        title: o.title ?? "",
        url: o.url ?? "",
        hidden: o.hidden ?? false,
        ...(o.itemType ? { itemType: o.itemType } : {}),
        ...(o.parentLocationSlug ? { parentLocationSlug: o.parentLocationSlug } : {}),
      })),
      subItems: (item.subItems ?? []).map((s) => ({
        id: s.id ?? genId(),
        name: s.name ?? "",
        url: s.url ?? "",
      })),
    })),
  );
}

function findCategoryTree(tree: MenuTreeCategory[], category: string): MenuTreeCategory | undefined {
  return tree.find((c) => c.category === category);
}

function findLocationInTree(
  tree: MenuTreeCategory[],
  category: string,
  locationSlug: string,
): MenuTreeLocation | undefined {
  return findCategoryTree(tree, category)?.locations.find((l) => l.slug === locationSlug);
}

function getOverrideMap(item: NavConfigItem): Map<string, SubItemOverride> {
  return new Map((item.subItemOverrides ?? []).map((o) => [o.slug, o]));
}

/** Build WordPress-style structure rows for the admin panel */
export function buildStructureNodes(
  items: NavConfigItem[],
  menuTree: MenuTreeCategory[],
): StructureNode[] {
  const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const nodes: StructureNode[] = [];

  for (const item of sorted) {
    if (item.type === "category") {
      const catTree = findCategoryTree(menuTree, item.reference ?? "");
      const overrideMap = getOverrideMap(item);
      const autoPopulate = item.autoPopulate !== false;

      nodes.push({
        key: `cat-${item.id}`,
        type: "category",
        label: item.label?.trim() || item.reference || "Unnamed Category",
        depth: 0,
        navItemId: item.id,
        reference: item.reference,
        editTarget: "category",
      });

      const locationSlugs: string[] = [];
      const customOverrides = (item.subItemOverrides ?? []).filter(
        (o) => o.itemType === "custom" && !o.hidden,
      );
      if (autoPopulate && catTree) {
        for (const loc of catTree.locations) {
          if (!overrideMap.get(loc.slug)?.hidden) locationSlugs.push(loc.slug);
        }
        for (const ov of item.subItemOverrides ?? []) {
          if (ov.itemType === "package" || ov.itemType === "custom") continue;
          if (!locationSlugs.includes(ov.slug) && !ov.hidden) locationSlugs.unshift(ov.slug);
        }
      } else {
        for (const ov of item.subItemOverrides ?? []) {
          if (ov.itemType === "package" || ov.itemType === "custom") continue;
          if (!ov.hidden) locationSlugs.push(ov.slug);
        }
      }

      // Respect override order for manual entries first
      const orderedLocationSlugs = autoPopulate
        ? [
            ...(item.subItemOverrides ?? [])
              .filter(
                (o) =>
                  o.itemType !== "package" && o.itemType !== "custom" && locationSlugs.includes(o.slug),
              )
              .map((o) => o.slug),
            ...locationSlugs.filter(
              (s) =>
                !(item.subItemOverrides ?? []).some(
                  (o) => o.slug === s && o.itemType !== "package" && o.itemType !== "custom",
                ),
            ),
          ]
        : locationSlugs;

      const seenLoc = new Set<string>();
        for (const locSlug of orderedLocationSlugs) {
        if (seenLoc.has(locSlug)) continue;
        seenLoc.add(locSlug);

        const dbLoc = catTree?.locations.find((l) => l.slug === locSlug);
        const ov = overrideMap.get(locSlug);
        if (ov?.hidden) continue;

        nodes.push({
          key: `loc-${item.id}-${locSlug}`,
          type: "location",
          label: ov?.title?.trim() || dbLoc?.title || locSlug,
          depth: 1,
          navItemId: item.id,
          slug: locSlug,
          url: ov?.url?.trim() || dbLoc?.url || `/${locSlug}`,
          hidden: ov?.hidden,
          editTarget: "override",
          overrideSlug: locSlug,
          overrideItemType: "location",
        });
      }

      for (const custom of customOverrides) {
        nodes.push({
          key: `cat-custom-${item.id}-${custom.slug}`,
          type: "custom-sub",
          label: custom.title?.trim() || "Unnamed Sub-link",
          depth: 1,
          navItemId: item.id,
          url: custom.url,
          editTarget: "override",
          overrideSlug: custom.slug,
          overrideItemType: "custom",
        });
      }
    } else {
      nodes.push({
        key: `custom-${item.id}`,
        type: "custom",
        label: item.name?.trim() || "Unnamed Link",
        depth: 0,
        navItemId: item.id,
        url: item.url,
        editTarget: "custom",
      });

      for (const sub of item.subItems ?? []) {
        nodes.push({
          key: `sub-${item.id}-${sub.id}`,
          type: "custom-sub",
          label: sub.name?.trim() || "Unnamed Sub-link",
          depth: 1,
          navItemId: item.id,
          url: sub.url,
          editTarget: "custom-sub",
          subItemId: sub.id,
        });
      }
    }
  }

  return nodes;
}

export function categoryAlreadyUsed(items: NavConfigItem[], category: string): boolean {
  return items.some((i) => i.type === "category" && i.reference === category);
}

export function addCategoryItem(items: NavConfigItem[], category: string): NavConfigItem[] {
  if (categoryAlreadyUsed(items, category)) return items;
  const newItem: NavConfigItem = {
    id: genId(),
    type: "category",
    order: items.length,
    reference: category,
    label: "",
    autoPopulate: true,
    subItemOverrides: [],
  };
  return reorder([...items, newItem]);
}

export function addCustomItem(items: NavConfigItem[]): NavConfigItem[] {
  const newItem: NavConfigItem = {
    id: genId(),
    type: "custom",
    order: items.length,
    name: "",
    url: "",
    subItems: [],
  };
  return reorder([...items, newItem]);
}

export function addLocationToCategory(
  items: NavConfigItem[],
  navItemId: string,
  location: MenuTreeLocation,
): NavConfigItem[] {
  return items.map((item) => {
    if (item.id !== navItemId || item.type !== "category") return item;
    const overrides = item.subItemOverrides ?? [];
    if (overrides.some((o) => o.slug === location.slug && o.itemType !== "package")) return item;
    return {
      ...item,
      autoPopulate: false,
      subItemOverrides: [
        ...overrides,
        {
          slug: location.slug,
          title: "",
          url: "",
          hidden: false,
          itemType: "location",
        },
      ],
    };
  });
}

export function addPackageToCategory(
  items: NavConfigItem[],
  navItemId: string,
  pkg: MenuTreePackage,
  parentLocationSlug: string,
): NavConfigItem[] {
  return items.map((item) => {
    if (item.id !== navItemId || item.type !== "category") return item;
    const overrides = item.subItemOverrides ?? [];
    if (overrides.some((o) => o.slug === pkg.slug)) return item;
    return {
      ...item,
      subItemOverrides: [
        ...overrides,
        {
          slug: pkg.slug,
          title: pkg.title,
          url: pkg.url,
          hidden: false,
          itemType: "package",
          parentLocationSlug,
        },
      ],
    };
  });
}

export function removeNavItem(items: NavConfigItem[], id: string): NavConfigItem[] {
  return reorder(items.filter((i) => i.id !== id));
}

export function moveNavItem(items: NavConfigItem[], id: string, dir: -1 | 1): NavConfigItem[] {
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return items;
  const next = [...items];
  const swap = idx + dir;
  if (swap < 0 || swap >= next.length) return items;
  [next[idx], next[swap]] = [next[swap]!, next[idx]!];
  return reorder(next);
}

export function updateNavItem(items: NavConfigItem[], updated: NavConfigItem): NavConfigItem[] {
  return items.map((i) => (i.id === updated.id ? updated : i));
}

export function updateStructureLabel(
  items: NavConfigItem[],
  node: StructureNode,
  label: string,
): NavConfigItem[] {
  return items.map((item) => {
    if (item.id !== node.navItemId) return item;

    if (node.editTarget === "category") {
      return { ...item, label };
    }
    if (node.editTarget === "custom") {
      return { ...item, name: label };
    }
    if (node.editTarget === "custom-sub" && node.subItemId) {
      return {
        ...item,
        subItems: (item.subItems ?? []).map((s) =>
          s.id === node.subItemId ? { ...s, name: label } : s,
        ),
      };
    }
    if (node.editTarget === "override" && node.overrideSlug) {
      return {
        ...item,
        subItemOverrides: upsertOverride(item.subItemOverrides ?? [], node.overrideSlug, { title: label }),
      };
    }
    return item;
  });
}

export function updateStructureUrl(
  items: NavConfigItem[],
  node: StructureNode,
  url: string,
): NavConfigItem[] {
  return items.map((item) => {
    if (item.id !== node.navItemId) return item;

    if (node.editTarget === "custom") {
      return { ...item, url };
    }
    if (node.editTarget === "custom-sub" && node.subItemId) {
      return {
        ...item,
        subItems: (item.subItems ?? []).map((s) =>
          s.id === node.subItemId ? { ...s, url } : s,
        ),
      };
    }
    if (node.editTarget === "override" && node.overrideSlug) {
      return {
        ...item,
        subItemOverrides: upsertOverride(item.subItemOverrides ?? [], node.overrideSlug, { url }),
      };
    }
    return item;
  });
}

export type ParentTarget =
  | { type: "root" }
  | { type: "category"; id: string }
  | { type: "custom"; id: string };

export interface NestedCustomSource {
  /** category id (parent owning the override) */
  categoryId?: string;
  /** override slug for category-nested customs (`custom-...`) */
  overrideSlug?: string;
  /** parent custom item id (when source is a custom-subitem) */
  customParentId?: string;
  /** subItem id when source is a custom-subitem */
  subItemId?: string;
}

function makeCustomItem(name: string, url: string, id?: string): NavConfigItem {
  return {
    id: id ?? genId(),
    type: "custom",
    order: 0,
    name: name || "Untitled",
    url: url || "#",
    subItems: [],
  };
}

/**
 * Convert a category location into a top-level custom link.
 * - autoPopulate=true → mark location as hidden via override
 * - autoPopulate=false → remove the location override
 */
export function promoteLocationToTopLevel(
  items: NavConfigItem[],
  categoryId: string,
  locationSlug: string,
  label: string,
  url: string,
): NavConfigItem[] {
  let updated = false;
  const intermediate = items.map((item) => {
    if (item.id !== categoryId || item.type !== "category") return item;
    updated = true;
    const autoPopulate = item.autoPopulate !== false;
    const overrides = item.subItemOverrides ?? [];

    if (autoPopulate) {
      const existingIdx = overrides.findIndex((o) => o.slug === locationSlug);
      const next =
        existingIdx >= 0
          ? overrides.map((o, i) => (i === existingIdx ? { ...o, hidden: true } : o))
          : [
              ...overrides,
              {
                slug: locationSlug,
                title: "",
                url: "",
                hidden: true,
                itemType: "location" as const,
              },
            ];
      return { ...item, subItemOverrides: next };
    }

    return {
      ...item,
      subItemOverrides: overrides.filter((o) => o.slug !== locationSlug),
    };
  });

  if (!updated) return items;

  return reorder([
    ...intermediate,
    makeCustomItem(label || locationSlug, url || `/${locationSlug}`),
  ]);
}

/** Move a category-nested custom child OR custom sub-item to a new parent. */
export function moveNestedCustomToParent(
  items: NavConfigItem[],
  source: NestedCustomSource,
  target: ParentTarget,
): NavConfigItem[] {
  let label = "";
  let url = "";
  let preservedId: string | undefined;

  let intermediate = items;

  if (source.categoryId && source.overrideSlug) {
    const cat = items.find((i) => i.id === source.categoryId && i.type === "category");
    if (!cat) return items;
    const ov = (cat.subItemOverrides ?? []).find((o) => o.slug === source.overrideSlug);
    if (!ov || ov.itemType !== "custom") return items;
    label = ov.title;
    url = ov.url;
    if (source.overrideSlug.startsWith("custom-")) {
      preservedId = source.overrideSlug.slice("custom-".length);
    }
    intermediate = items.map((item) =>
      item.id === source.categoryId
        ? {
            ...item,
            subItemOverrides: (item.subItemOverrides ?? []).filter(
              (o) => o.slug !== source.overrideSlug,
            ),
          }
        : item,
    );
  } else if (source.customParentId && source.subItemId) {
    const parent = items.find((i) => i.id === source.customParentId && i.type === "custom");
    if (!parent) return items;
    const sub = (parent.subItems ?? []).find((s) => s.id === source.subItemId);
    if (!sub) return items;
    label = sub.name;
    url = sub.url;
    preservedId = sub.id;
    intermediate = items.map((item) =>
      item.id === source.customParentId
        ? { ...item, subItems: (item.subItems ?? []).filter((s) => s.id !== source.subItemId) }
        : item,
    );
  } else {
    return items;
  }

  if (target.type === "root") {
    return reorder([...intermediate, makeCustomItem(label, url, preservedId)]);
  }

  if (target.type === "category") {
    const slug = preservedId ? `custom-${preservedId}` : `custom-${genId()}`;
    let found = false;
    const next = intermediate.map((item) => {
      if (item.id !== target.id || item.type !== "category") return item;
      found = true;
      const overrides = item.subItemOverrides ?? [];
      const existingIdx = overrides.findIndex((o) => o.slug === slug);
      const entry: SubItemOverride = {
        slug,
        title: label || "Untitled",
        url: url || "#",
        hidden: false,
        itemType: "custom",
      };
      if (existingIdx >= 0) {
        const copy = [...overrides];
        copy[existingIdx] = entry;
        return { ...item, subItemOverrides: copy };
      }
      return { ...item, subItemOverrides: [...overrides, entry] };
    });
    return found ? reorder(next) : items;
  }

  let found = false;
  const next = intermediate.map((item) => {
    if (item.id !== target.id || item.type !== "custom") return item;
    found = true;
    const subItems = item.subItems ?? [];
    const newSub = { id: preservedId ?? genId(), name: label || "Untitled", url: url || "#" };
    const existingIdx = subItems.findIndex((s) => s.id === newSub.id);
    if (existingIdx >= 0) {
      const copy = [...subItems];
      copy[existingIdx] = newSub;
      return { ...item, subItems: copy };
    }
    return { ...item, subItems: [...subItems, newSub] };
  });
  return found ? reorder(next) : items;
}

export function moveCustomItemToParent(
  items: NavConfigItem[],
  customId: string,
  target: { type: "root" } | { type: "category"; id: string } | { type: "custom"; id: string },
): NavConfigItem[] {
  const customItem = items.find((i) => i.id === customId && i.type === "custom");
  if (!customItem) return items;

  const source = items.filter((i) => i.id !== customId);
  const customName = customItem.name?.trim() || "Untitled";
  const customUrl = customItem.url?.trim() || "#";

  if (target.type === "root") {
    return reorder([...source, { ...customItem, subItems: customItem.subItems ?? [] }]);
  }

  if (target.type === "category") {
    const slug = `custom-${customItem.id}`;
    let found = false;
    const next = source.map((item) => {
      if (item.id !== target.id || item.type !== "category") return item;
      found = true;
      const overrides = item.subItemOverrides ?? [];
      const existingIdx = overrides.findIndex((o) => o.slug === slug);
      if (existingIdx >= 0) {
        const copy = [...overrides];
        copy[existingIdx] = {
          ...copy[existingIdx]!,
          title: customName,
          url: customUrl,
          hidden: false,
          itemType: "custom",
        };
        return { ...item, subItemOverrides: copy };
      }
      return {
        ...item,
        subItemOverrides: [
          ...overrides,
          {
            slug,
            title: customName,
            url: customUrl,
            hidden: false,
            itemType: "custom" as const,
          },
        ],
      };
    });
    return found ? reorder(next) : items;
  }

  let found = false;
  const next = source.map((item) => {
    if (item.id !== target.id || item.type !== "custom") return item;
    found = true;
    const subItems = item.subItems ?? [];
    const existingIdx = subItems.findIndex((s) => s.id === customItem.id);
    if (existingIdx >= 0) {
      const copy = [...subItems];
      copy[existingIdx] = { ...copy[existingIdx]!, name: customName, url: customUrl };
      return { ...item, subItems: copy };
    }
    return {
      ...item,
      subItems: [...subItems, { id: customItem.id, name: customName, url: customUrl }],
    };
  });

  return found ? reorder(next) : items;
}

export function removeStructureNode(items: NavConfigItem[], node: StructureNode): NavConfigItem[] {
  if (node.type === "category" || node.type === "custom") {
    return removeNavItem(items, node.navItemId);
  }

  return items.map((item) => {
    if (item.id !== node.navItemId) return item;

    if (node.editTarget === "custom-sub" && node.subItemId) {
      return {
        ...item,
        subItems: (item.subItems ?? []).filter((s) => s.id !== node.subItemId),
      };
    }
    if (node.editTarget === "override" && node.overrideSlug) {
      return {
        ...item,
        subItemOverrides: (item.subItemOverrides ?? []).filter((o) => o.slug !== node.overrideSlug),
      };
    }
    return item;
  });
}

function upsertOverride(
  overrides: SubItemOverride[],
  slug: string,
  patch: Partial<SubItemOverride>,
): SubItemOverride[] {
  const exists = overrides.some((o) => o.slug === slug);
  if (exists) {
    return overrides.map((o) => (o.slug === slug ? { ...o, ...patch } : o));
  }
  return [
    ...overrides,
    {
      slug,
      title: "",
      url: "",
      hidden: false,
      ...patch,
    },
  ];
}

export function getNavItemById(items: NavConfigItem[], id: string): NavConfigItem | undefined {
  return items.find((i) => i.id === id);
}

export function isCategoryInMenu(items: NavConfigItem[], category: string): boolean {
  return categoryAlreadyUsed(items, category);
}

export function isLocationInMenu(
  items: NavConfigItem[],
  category: string,
  locationSlug: string,
): boolean {
  const catItem = items.find((i) => i.type === "category" && i.reference === category);
  if (!catItem) return false;
  if (catItem.autoPopulate !== false) {
    return !(catItem.subItemOverrides ?? []).some(
      (o) => o.slug === locationSlug && o.itemType !== "package" && o.hidden,
    );
  }
  return (catItem.subItemOverrides ?? []).some(
    (o) => o.slug === locationSlug && o.itemType !== "package" && !o.hidden,
  );
}

export function isPackageInMenu(
  items: NavConfigItem[],
  category: string,
  packageSlug: string,
): boolean {
  const catItem = items.find((i) => i.type === "category" && i.reference === category);
  if (!catItem) return false;
  return (catItem.subItemOverrides ?? []).some(
    (o) => o.slug === packageSlug && o.itemType === "package" && !o.hidden,
  );
}

/** Batch-add picker selections into the menu (creates category if needed). */
export function addPickerSelections(
  items: NavConfigItem[],
  menuTree: MenuTreeCategory[],
  categoryName: string,
  selected: {
    includeCategory: boolean;
    locationSlugs: string[];
  },
): NavConfigItem[] {
  const catTree = menuTree.find((c) => c.category === categoryName);
  if (!catTree) return items;

  let next = items;

  const needsCategory =
    selected.includeCategory || selected.locationSlugs.length > 0;

  if (needsCategory && !categoryAlreadyUsed(next, categoryName)) {
    next = addCategoryItem(next, categoryName);
    if (!selected.includeCategory && selected.locationSlugs.length > 0) {
      next = next.map((item) =>
        item.type === "category" && item.reference === categoryName
          ? { ...item, autoPopulate: false, subItemOverrides: [] }
          : item,
      );
    }
  }

  const navId = next.find((i) => i.type === "category" && i.reference === categoryName)?.id;
  if (!navId) return next;

  for (const locSlug of selected.locationSlugs) {
    const loc = catTree.locations.find((l) => l.slug === locSlug);
    if (loc && !isLocationInMenu(next, categoryName, locSlug)) {
      next = addLocationToCategory(next, navId, loc);
    }
  }

  return next;
}

/** Collect indices to move together (parent + its children). */
function getDragBlockIndices(structure: StructureNode[], fromKey: string): number[] {
  const fromIdx = structure.findIndex((n) => n.key === fromKey);
  if (fromIdx < 0) return [];

  const node = structure[fromIdx]!;
  if (node.depth === 0 && (node.type === "category" || node.type === "custom")) {
    const indices = [fromIdx];
    for (let i = fromIdx + 1; i < structure.length; i++) {
      const next = structure[i];
      if (!next || next.depth === 0) break;
      if (next.navItemId === node.navItemId) indices.push(i);
    }
    return indices;
  }
  return [fromIdx];
}

/** Rebuild menu from any flat order — supports free moves like WordPress. */
function rebuildMenuFromFlatOrder(
  items: NavConfigItem[],
  _menuTree: MenuTreeCategory[],
  ordered: StructureNode[],
): NavConfigItem[] {
  const idToItem = new Map(items.map((i) => [i.id, i]));

  const overrideBySlug = new Map<string, SubItemOverride>();
  for (const item of items) {
    for (const ov of item.subItemOverrides ?? []) {
      overrideBySlug.set(ov.slug, ov);
    }
  }

  const newTopLevel: NavConfigItem[] = [];
  let currentCategory: NavConfigItem | null = null;
  let currentCustom: NavConfigItem | null = null;
  const categoryLocations = new Map<string, SubItemOverride[]>();
  const customSubItems = new Map<string, { id: string; name: string; url: string }[]>();
  const categoriesWithChildren = new Set<string>();

  const applyCategoryLocations = (cat: NavConfigItem) => {
    if (!categoriesWithChildren.has(cat.id)) return;
    const locs = categoryLocations.get(cat.id) ?? [];
    const idx = newTopLevel.findIndex((i) => i.id === cat.id);
    if (idx < 0) return;
    newTopLevel[idx] = {
      ...newTopLevel[idx]!,
      autoPopulate: false,
      subItemOverrides: locs,
    };
  };

  const applyCustomSubs = (custom: NavConfigItem) => {
    const subs = customSubItems.get(custom.id);
    if (subs === undefined) return;
    const idx = newTopLevel.findIndex((i) => i.id === custom.id);
    if (idx < 0) return;
    newTopLevel[idx] = { ...newTopLevel[idx]!, subItems: subs };
  };

  for (const node of ordered) {
    if (node.type === "category") {
      if (currentCategory) applyCategoryLocations(currentCategory);
      if (currentCustom) applyCustomSubs(currentCustom);
      currentCustom = null;

      const existing = idToItem.get(node.navItemId);
      if (!existing || existing.type !== "category") continue;

      currentCategory = { ...existing };
      categoryLocations.set(currentCategory.id, []);
      newTopLevel.push(currentCategory);
    } else if (node.type === "custom") {
      if (currentCategory) applyCategoryLocations(currentCategory);
      if (currentCustom) applyCustomSubs(currentCustom);
      currentCategory = null;

      const existing = idToItem.get(node.navItemId);
      if (!existing || existing.type !== "custom") continue;

      currentCustom = { ...existing };
      customSubItems.set(currentCustom.id, []);
      newTopLevel.push(currentCustom);
    } else if (node.type === "location") {
      const slug = node.overrideSlug ?? node.slug ?? "";
      const existing = overrideBySlug.get(slug);
      const ov: SubItemOverride = {
        slug,
        title: existing?.title || node.label,
        url: existing?.url || node.url || (slug ? `/${slug}` : ""),
        hidden: existing?.hidden ?? false,
        itemType: node.overrideItemType ?? existing?.itemType ?? "location",
        ...(existing?.parentLocationSlug ? { parentLocationSlug: existing.parentLocationSlug } : {}),
      };

      if (currentCategory) {
        categoriesWithChildren.add(currentCategory.id);
        const list = categoryLocations.get(currentCategory.id) ?? [];
        list.push(ov);
        categoryLocations.set(currentCategory.id, list);
      } else {
        if (currentCustom) applyCustomSubs(currentCustom);
        currentCategory = null;
        currentCustom = null;
        newTopLevel.push({
          id: genId(),
          type: "custom",
          order: newTopLevel.length,
          name: node.label,
          url: node.url || (slug ? `/${slug}` : "#"),
          subItems: [],
        });
      }
    } else if (node.type === "custom-sub") {
      // Category-nested custom child (editTarget = "override")
      if (node.editTarget === "override" && currentCategory) {
        categoriesWithChildren.add(currentCategory.id);
        const list = categoryLocations.get(currentCategory.id) ?? [];
        list.push({
          slug: node.overrideSlug ?? `custom-${genId()}`,
          title: node.label,
          url: node.url ?? "#",
          hidden: false,
          itemType: "custom",
        });
        categoryLocations.set(currentCategory.id, list);
        continue;
      }

      // Sub-item belonging to a top-level custom item
      const origParent = idToItem.get(node.navItemId);
      const sub =
        origParent?.subItems?.find((s) => s.id === node.subItemId) ??
        { id: node.subItemId ?? genId(), name: node.label, url: node.url ?? "#" };

      if (currentCustom) {
        const list = customSubItems.get(currentCustom.id) ?? [];
        list.push(sub);
        customSubItems.set(currentCustom.id, list);
      }
      // If neither a category nor custom is open, ignore orphan sub-items.
    }
  }

  if (currentCategory) applyCategoryLocations(currentCategory);
  if (currentCustom) applyCustomSubs(currentCustom);

  return reorder(newTopLevel);
}

/** Drag-reorder / reparent any structure row (WordPress-style free movement). */
export function reorderStructureNodes(
  items: NavConfigItem[],
  menuTree: MenuTreeCategory[],
  fromKey: string,
  toKey: string,
  position: "before" | "after" = "after",
): NavConfigItem[] {
  if (fromKey === toKey) return items;

  const structure = buildStructureNodes(items, menuTree);
  const blockIndices = getDragBlockIndices(structure, fromKey);
  if (blockIndices.length === 0) return items;

  if (blockIndices.some((i) => structure[i]?.key === toKey)) return items;

  const block = blockIndices.map((i) => structure[i]!);
  const remaining = structure.filter((_, i) => !blockIndices.includes(i));
  const toIdx = remaining.findIndex((n) => n.key === toKey);
  if (toIdx < 0) return items;
  const insertAt = position === "before" ? toIdx : toIdx + 1;
  remaining.splice(insertAt, 0, ...block);

  return rebuildMenuFromFlatOrder(items, menuTree, remaining);
}

/** Move a structure node one step up/down in the full menu list. */
export function moveStructureNode(
  items: NavConfigItem[],
  menuTree: MenuTreeCategory[],
  nodeKey: string,
  dir: -1 | 1,
): NavConfigItem[] {
  const structure = buildStructureNodes(items, menuTree);
  const blockIndices = getDragBlockIndices(structure, nodeKey);
  if (blockIndices.length === 0) return items;

  const firstIdx = blockIndices[0]!;
  const targetIdx = dir === -1 ? firstIdx - 1 : blockIndices[blockIndices.length - 1]! + 1;
  if (targetIdx < 0 || targetIdx >= structure.length) return items;

  const targetKey = structure[targetIdx]?.key;
  if (!targetKey) return items;

  return reorderStructureNodes(items, menuTree, nodeKey, targetKey, dir === -1 ? "before" : "after");
}

/* ═══════════════════════════════════════════════════════════════════════════════════
 *  Drag-and-drop projection (used by @dnd-kit sortable list)
 *  Pattern follows the dnd-kit "Sortable Tree" example, adapted for our hybrid model
 *  (categories / locations / custom links / sub-items, max depth = 1).
 * ═══════════════════════════════════════════════════════════════════════════════════ */

export interface DragProjection {
  /** Final depth the dragged item will land at (0 or 1). */
  depth: number;
  /** Structure key of the new parent (if depth === 1), else null. */
  parentKey: string | null;
  /** navItemId of the new parent (if depth === 1), else null. */
  parentNavId: string | null;
  /** Human-readable label of the new parent (for UI). */
  parentLabel: string | null;
  /** Whether this drag is allowed by nesting rules. */
  allowed: boolean;
}

const MAX_DEPTH = 1;

const REJECTED: DragProjection = {
  depth: 0,
  parentKey: null,
  parentNavId: null,
  parentLabel: null,
  allowed: false,
};

function navIdFromKey(key: string): string | null {
  if (key.startsWith("cat-")) return key.slice("cat-".length);
  if (key.startsWith("custom-")) return key.slice("custom-".length);
  return null;
}

/**
 * Project the desired (depth, parent) when dragging `activeKey` over `overKey`.
 * `dragOffsetX` is the cursor delta-x in pixels. Half-indent threshold means a
 * drag of ~14px (when indentWidth = 28) triggers nesting / outdenting.
 */
export function projectDrag(
  items: NavConfigItem[],
  menuTree: MenuTreeCategory[],
  activeKey: string,
  overKey: string,
  dragOffsetX: number,
  indentWidth = 28,
): DragProjection {
  const structure = buildStructureNodes(items, menuTree);

  const activeIdx = structure.findIndex((n) => n.key === activeKey);
  const overIdx = structure.findIndex((n) => n.key === overKey);
  if (activeIdx < 0 || overIdx < 0) return REJECTED;

  const active = structure[activeIdx]!;

  const blockIndices = new Set(getDragBlockIndices(structure, activeKey));
  if (blockIndices.has(overIdx)) return REJECTED;

  const afterRemoval = structure.filter((_, i) => !blockIndices.has(i));
  const newOverIdx = afterRemoval.findIndex((n) => n.key === overKey);
  if (newOverIdx < 0) return REJECTED;

  const previous = afterRemoval[newOverIdx];
  const next = afterRemoval[newOverIdx + 1];

  // Use half-indent threshold for snappier nesting/outdenting.
  const halfIndent = Math.max(8, indentWidth * 0.5);
  let dragOffsetDepth = 0;
  if (dragOffsetX > halfIndent) {
    dragOffsetDepth = Math.min(MAX_DEPTH, Math.floor((dragOffsetX + halfIndent) / indentWidth));
  } else if (dragOffsetX < -halfIndent) {
    dragOffsetDepth = -Math.min(
      MAX_DEPTH,
      Math.floor((-dragOffsetX + halfIndent) / indentWidth),
    );
  }
  const projectedDepth = Math.max(0, Math.min(MAX_DEPTH, active.depth + dragOffsetDepth));

  // Allowed depth range:
  //   maxDepth — can't go deeper than previous + 1 (or MAX_DEPTH).
  //   minDepth — when outdenting, we ignore the next sibling's depth so the user
  //              can drop a child out of its group at any position. Trailing
  //              siblings stay with their original parent in the rebuild.
  const maxDepth = (() => {
    if (!previous) return 0;
    if (previous.depth === 0) return MAX_DEPTH;
    return previous.depth;
  })();
  const minDepth = next && dragOffsetX > -halfIndent ? next.depth : 0;

  let depth = projectedDepth;
  if (depth > maxDepth) depth = maxDepth;
  if (depth < minDepth) depth = minDepth;

  let parentKey: string | null = null;
  let parentLabel: string | null = null;
  if (depth > 0) {
    for (let i = newOverIdx; i >= 0; i--) {
      const candidate = afterRemoval[i]!;
      if (candidate.depth === 0) {
        parentKey = candidate.key;
        parentLabel = candidate.label;
        break;
      }
    }
  }

  const allowed = isMoveAllowed(active, depth, parentKey, structure);
  const parentNavId = parentKey ? navIdFromKey(parentKey) : null;

  return { depth, parentKey, parentNavId, parentLabel, allowed };
}

function isMoveAllowed(
  active: StructureNode,
  depth: number,
  parentKey: string | null,
  structure: StructureNode[],
): boolean {
  if (active.type === "category" && depth > 0) return false;

  if (depth === 0) return true;

  if (!parentKey) return false;
  const parent = structure.find((n) => n.key === parentKey);
  if (!parent) return false;

  if (parent.type !== "category" && parent.type !== "custom") return false;
  return true;
}

interface ProjectedNode extends StructureNode {
  /** Override the parent navItemId (used for the dragged active row). */
  forceParentNavId?: string | null;
  /** Mark the dragged row so promotion to top-level is handled correctly. */
  isActive?: boolean;
}

/**
 * Apply a drag move: compute the new menu state when `activeKey` is dropped
 * at the given projection (depth, parentKey).
 */
export function dragRebuild(
  items: NavConfigItem[],
  menuTree: MenuTreeCategory[],
  activeKey: string,
  overKey: string,
  projection: DragProjection,
): NavConfigItem[] {
  if (!projection.allowed) return items;
  if (activeKey === overKey) return items;

  const structure = buildStructureNodes(items, menuTree);
  const blockIndices = getDragBlockIndices(structure, activeKey);
  if (blockIndices.length === 0) return items;

  if (blockIndices.some((i) => structure[i]?.key === overKey)) return items;

  const block = blockIndices.map((i) => structure[i]!);
  const blockHead = block[0]!;
  const headBecomesChild =
    (blockHead.type === "category" || blockHead.type === "custom") && projection.depth > 0;

  const adjustedBlock: ProjectedNode[] = block.map((node, idx) => {
    if (idx === 0) {
      return {
        ...node,
        depth: projection.depth,
        forceParentNavId: projection.depth > 0 ? projection.parentNavId : null,
        isActive: true,
      };
    }
    const childDepth = Math.min(MAX_DEPTH, projection.depth + 1);
    return { ...node, depth: childDepth };
  });

  const finalBlock = headBecomesChild ? [adjustedBlock[0]!] : adjustedBlock;

  const remaining: ProjectedNode[] = structure
    .filter((_, i) => !blockIndices.includes(i))
    .map((node) => ({ ...node }));
  const overIdx = remaining.findIndex((n) => n.key === overKey);
  if (overIdx < 0) return items;

  remaining.splice(overIdx + 1, 0, ...finalBlock);

  return rebuildFromProjectedFlat(items, menuTree, remaining);
}

/**
 * Rebuild NavConfigItem[] from a flat ordered structure.
 *
 * Important: trailing depth-1 siblings of an outdented item stay with their
 * ORIGINAL parent (via navItemId). Only the dragged active row uses the
 * projection target.
 */
function rebuildFromProjectedFlat(
  items: NavConfigItem[],
  _menuTree: MenuTreeCategory[],
  ordered: ProjectedNode[],
): NavConfigItem[] {
  const idToItem = new Map(items.map((i) => [i.id, i]));
  const overrideBySlug = new Map<string, SubItemOverride>();
  for (const item of items) {
    for (const ov of item.subItemOverrides ?? []) {
      overrideBySlug.set(ov.slug, ov);
    }
  }

  const newTopLevel: NavConfigItem[] = [];
  const topLevelById = new Map<string, NavConfigItem>();
  // Tracks the closest valid host (depth-0 category or custom) when walking.
  let activeFallbackParent: NavConfigItem | null = null;

  const pushTopLevel = (node: ProjectedNode): NavConfigItem | null => {
    if (node.type === "category") {
      const existing = idToItem.get(node.navItemId);
      if (!existing || existing.type !== "category") return null;
      if (topLevelById.has(existing.id)) return null;
      const clone: NavConfigItem = {
        ...existing,
        autoPopulate: false,
        subItemOverrides: [],
      };
      newTopLevel.push(clone);
      topLevelById.set(existing.id, clone);
      return clone;
    }
    if (node.type === "custom") {
      const existing = idToItem.get(node.navItemId);
      if (!existing || existing.type !== "custom") return null;
      if (topLevelById.has(existing.id)) return null;
      const clone: NavConfigItem = { ...existing, subItems: [] };
      newTopLevel.push(clone);
      topLevelById.set(existing.id, clone);
      return clone;
    }
    // Promotion: location or custom-sub becomes a fresh top-level custom link.
    const id =
      node.type === "custom-sub" && node.subItemId
        ? node.subItemId
        : node.type === "location" && node.slug
          ? node.slug
          : genId();
    const safeId = topLevelById.has(id) ? genId() : id;
    const fallbackUrl = node.url ?? (node.slug ? `/${node.slug}` : "#");
    const created: NavConfigItem = {
      id: safeId,
      type: "custom",
      order: newTopLevel.length,
      name: node.label || "Untitled",
      url: fallbackUrl,
      subItems: [],
    };
    newTopLevel.push(created);
    topLevelById.set(safeId, created);
    return created;
  };

  const attachChild = (parent: NavConfigItem, node: ProjectedNode): void => {
    if (parent.type === "category") {
      const overrides = parent.subItemOverrides ?? [];
      if (node.type === "location") {
        const slug = node.overrideSlug ?? node.slug ?? "";
        if (!slug) return;
        if (overrides.some((o) => o.slug === slug)) return;
        const existing = overrideBySlug.get(slug);
        overrides.push({
          slug,
          title: existing?.title || node.label,
          url: existing?.url || node.url || `/${slug}`,
          hidden: false,
          itemType: "location",
          ...(existing?.parentLocationSlug
            ? { parentLocationSlug: existing.parentLocationSlug }
            : {}),
        });
      } else if (
        node.type === "custom-sub" ||
        node.type === "custom" ||
        node.type === "category"
      ) {
        const slug = (() => {
          if (node.type === "custom-sub" && node.overrideSlug?.startsWith("custom-")) {
            return node.overrideSlug;
          }
          const sourceId =
            node.type === "custom"
              ? node.navItemId
              : node.subItemId ?? node.navItemId;
          return `custom-${sourceId}`;
        })();
        if (overrides.some((o) => o.slug === slug)) return;
        overrides.push({
          slug,
          title: node.label || "Untitled",
          url: node.url ?? "#",
          hidden: false,
          itemType: "custom",
        });
      }
      parent.subItemOverrides = overrides;
      return;
    }

    if (parent.type === "custom") {
      const subItems = parent.subItems ?? [];
      const id =
        node.type === "custom-sub" && node.subItemId
          ? node.subItemId
          : node.type === "location" && node.slug
            ? node.slug
            : node.type === "custom"
              ? node.navItemId
              : genId();
      if (subItems.some((s) => s.id === id)) return;
      subItems.push({
        id,
        name: node.label || "Untitled",
        url: node.url ?? (node.slug ? `/${node.slug}` : "#"),
      });
      parent.subItems = subItems;
    }
  };

  // First pass: create all top-level items (in their new order) so children can
  // reference their original parent later regardless of position.
  for (const node of ordered) {
    if (node.depth === 0) {
      const created = pushTopLevel(node);
      if (created && (created.type === "category" || created.type === "custom")) {
        activeFallbackParent = created;
      }
    }
  }

  // Second pass: attach depth-1 rows to the correct parent.
  //   – Dragged active row → projection's target parent (forceParentNavId).
  //   – Other rows → their original parent navItemId.
  //   – If neither is available → fall back to the most recent depth-0 host.
  activeFallbackParent = null;
  for (const node of ordered) {
    if (node.depth === 0) {
      const top = topLevelById.get(node.navItemId);
      if (top && (top.type === "category" || top.type === "custom")) {
        activeFallbackParent = top;
      }
      continue;
    }

    const desiredParentId = node.isActive
      ? node.forceParentNavId ?? null
      : node.navItemId;

    let parent: NavConfigItem | null = desiredParentId
      ? topLevelById.get(desiredParentId) ?? null
      : null;

    if (!parent || (parent.type !== "category" && parent.type !== "custom")) {
      parent = activeFallbackParent;
    }
    if (!parent) continue;

    attachChild(parent, node);
  }

  return reorder(newTopLevel);
}
