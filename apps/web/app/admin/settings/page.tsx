// apps/web/app/admin/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinkItem     { name: string; url: string; }
interface FooterColumn { title: string; links: LinkItem[]; }

/**
 * Per-location override stored inside a category NavConfigItem.
 * Empty title / url means "keep the DB value".
 */
interface SubItemOverride {
  slug:   string;
  title:  string;
  url:    string;
  hidden: boolean;
}

/**
 * One entry in the headerMenu array.
 *
 * type = "category"
 *   Drives a dropdown from Location records in the given category.
 *   autoPopulate = true  → all published locations shown (default).
 *   autoPopulate = false → only slugs in subItemOverrides are shown.
 *
 * type = "custom"
 *   Fully manual link with optional sub-items.
 */
interface NavConfigItem {
  id:    string;
  type:  "category" | "custom";
  order: number;
  // category fields
  reference?:        string;
  label?:            string;
  autoPopulate?:     boolean;
  subItemOverrides?: SubItemOverride[];
  // custom fields
  name?:     string;
  url?:      string;
  subItems?: { id: string; name: string; url: string }[];
}

/** Shape returned by GET /api/v1/navigation */
interface NavItem     { title: string; slug: string; }
interface NavCategory { category: string; slug: string; items: NavItem[]; }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const genId = () => Math.random().toString(36).slice(2, 10);

function parseJson<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value))      return value as T;
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { /* fall through */ }
  }
  return fallback;
}

/** Convert old flat { name, url, subItems }[] to NavConfigItem[] */
function migrateMenu(raw: any[]): NavConfigItem[] {
  return raw.map((item, i) => {
    if (item.type === "category" || item.type === "custom") {
      return { ...item, order: item.order ?? i } as NavConfigItem;
    }
    return {
      id:       item.id ?? genId(),
      type:     "custom" as const,
      order:    i,
      name:     item.name  ?? "",
      url:      item.url   ?? "",
      subItems: parseJson<any[]>(item.subItems, []).map((s: any, si: number) => ({
        id:   s.id ?? String(si),
        name: s.name ?? "",
        url:  s.url  ?? "",
      })),
    };
  });
}

/** Re-assign order by current array positions */
function reorder(items: NavConfigItem[]): NavConfigItem[] {
  return items.map((item, i) => ({ ...item, order: i }));
}

/**
 * In auto mode: merge existing overrides + append DB items not yet overridden.
 * In manual mode: only return items already in subItemOverrides (caller filters by dbSlugs).
 */
function getEffectiveOverrides(item: NavConfigItem, navCats: NavCategory[]): SubItemOverride[] {
  const cat = navCats.find(c => c.category === item.reference);
  if (!cat) return item.subItemOverrides ?? [];

  const existing    = item.subItemOverrides ?? [];
  const existingMap = new Map(existing.map(o => [o.slug, o]));
  const dbSlugs     = new Set(cat.items.map(i => i.slug));

  const fromOverrides = existing.filter(o => dbSlugs.has(o.slug));
  const appendOnly    = cat.items
    .filter(loc => !existingMap.has(loc.slug))
    .map(loc => ({ slug: loc.slug, title: "", url: "", hidden: false }));

  return [...fromOverrides, ...appendOnly];
}

// ─── Social links builder (footer) ───────────────────────────────────────────

const SocialLinksBuilder = ({ list, setter }: { list: LinkItem[]; setter: (l: LinkItem[]) => void }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-gray-900 dark:text-white">Social Media Links</h3>
      <button type="button" onClick={() => setter([...list, { name: "", url: "" }])}
        className="text-sm font-medium text-adventure-600 hover:text-adventure-700">+ Add Link</button>
    </div>
    <div className="space-y-3">
      {list.map((link, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="text" placeholder="Platform (e.g. Instagram)"
            className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm outline-none"
            value={link.name}
            onChange={e => { const n = [...list]; n[i] = { name: e.target.value, url: n[i]?.url ?? "" }; setter(n); }} />
          <input type="text" placeholder="URL"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm outline-none"
            value={link.url}
            onChange={e => { const n = [...list]; n[i] = { name: n[i]?.name ?? "", url: e.target.value }; setter(n); }} />
          <button type="button" onClick={() => setter(list.filter((_, j) => j !== i))}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      {list.length === 0 && <p className="text-xs text-gray-400">No social links added.</p>}
    </div>
  </div>
);

// ─── Category item editor ─────────────────────────────────────────────────────

function CategoryItemEditor({
  item, navCats, onChange,
}: {
  item:     NavConfigItem;
  navCats:  NavCategory[];
  onChange: (updated: NavConfigItem) => void;
}) {
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [pickedSlug,    setPickedSlug]    = useState("");

  const cat          = navCats.find(c => c.category === item.reference);
  const autoPopulate = item.autoPopulate !== false;

  const displayOverrides: SubItemOverride[] = autoPopulate
    ? getEffectiveOverrides(item, navCats)
    : (item.subItemOverrides ?? []).filter(o => cat?.items.some(i => i.slug === o.slug));

  const addedSlugs     = new Set((item.subItemOverrides ?? []).map(o => o.slug));
  const availableToAdd = (cat?.items ?? []).filter(i => !addedSlugs.has(i.slug));

  const updateOverride = (slug: string, patch: Partial<SubItemOverride>) => {
    const base = item.subItemOverrides ?? [];
    // If slug exists → update; if not → add (happens in auto mode when override is first edited)
    const exists = base.some(o => o.slug === slug);
    const next = exists
      ? base.map(o => o.slug === slug ? { ...o, ...patch } : o)
      : [...base, { slug, title: "", url: "", hidden: false, ...patch }];
    onChange({ ...item, subItemOverrides: next });
  };

  const moveOverride = (slug: string, dir: -1 | 1) => {
    const list = displayOverrides;
    const idx  = list.findIndex(o => o.slug === slug);
    if (idx < 0) return;
    const next    = [...list];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    const tmp = next[idx] as SubItemOverride;
    next[idx] = next[swapIdx] as SubItemOverride;
    next[swapIdx] = tmp;
    onChange({ ...item, subItemOverrides: next });
  };

  const addLocation = () => {
    if (!pickedSlug) return;
    const newOv: SubItemOverride = { slug: pickedSlug, title: "", url: "", hidden: false };
    onChange({ ...item, subItemOverrides: [...(item.subItemOverrides ?? []), newOv] });
    setPickedSlug("");
    setShowAddPicker(false);
  };

  const removeOverride = (slug: string) => {
    onChange({ ...item, subItemOverrides: (item.subItemOverrides ?? []).filter(o => o.slug !== slug) });
  };

  const toggleAutoPopulate = () => {
    if (autoPopulate) {
      // Auto → Manual: seed manual list from currently-visible (non-hidden) overrides only
      const seed = (item.subItemOverrides ?? []).filter(o => !o.hidden);
      onChange({ ...item, autoPopulate: false, subItemOverrides: seed });
    } else {
      onChange({ ...item, autoPopulate: true });
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {/* Display label */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider w-28 shrink-0">Display Label</label>
        <input type="text"
          placeholder={item.reference ?? "Category name"}
          value={item.label ?? ""}
          onChange={e => onChange({ ...item, label: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm outline-none" />
      </div>

      {/* Auto / Manual toggle */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
        <button type="button" role="switch" aria-checked={autoPopulate} onClick={toggleAutoPopulate}
          className={`relative shrink-0 mt-0.5 w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${autoPopulate ? "bg-[#135D66]" : "bg-gray-300 dark:bg-gray-600"}`}>
          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${autoPopulate ? "translate-x-5" : "translate-x-0"}`} />
        </button>
        <div className="flex-1 min-w-0">
          {autoPopulate ? (
            <>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Auto-populate all locations</p>
              <p className="text-xs text-gray-500 mt-0.5">
                All published locations in <strong>{item.reference}</strong> appear automatically.
                Use the eye icon to hide specific ones, or override their title / URL.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Manual selection</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Only the locations you add below are shown. Use <strong>Add Location</strong> to include specific ones.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Sub-items table */}
      <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">

        {/* Table header */}
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-600 gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
            {autoPopulate ? "Sub-items from database" : "Selected locations"}
            {cat && (
              <span className="ml-2 text-gray-400 font-normal normal-case">
                {autoPopulate
                  ? `(${cat.items.length} location${cat.items.length !== 1 ? "s" : ""})`
                  : `(${displayOverrides.length} of ${cat.items.length} selected)`}
              </span>
            )}
          </span>
          {!autoPopulate ? (
            <button type="button"
              onClick={() => { setShowAddPicker(v => !v); setPickedSlug(""); }}
              disabled={availableToAdd.length === 0}
              className="text-xs font-bold text-[#135D66] hover:text-[#0f4a52] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              {showAddPicker ? "Cancel" : "Add Location"}
            </button>
          ) : (
            <span className="text-xs text-gray-400">↑↓ reorder · eye hide · fields override</span>
          )}
        </div>

        {/* Inline add-location row (in-flow, not absolute — avoids overflow:hidden clipping) */}
        {!autoPopulate && showAddPicker && (
          <div className="flex items-center gap-2 px-3 py-3 bg-[#135D66]/5 border-b border-[#135D66]/20">
            <select value={pickedSlug} onChange={e => setPickedSlug(e.target.value)} autoFocus
              className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 outline-none focus:border-[#135D66]">
              <option value="">— choose a location from {item.reference} —</option>
              {availableToAdd.map(loc => (
                <option key={loc.slug} value={loc.slug}>{loc.title}</option>
              ))}
            </select>
            <button type="button" onClick={addLocation} disabled={!pickedSlug}
              className="shrink-0 px-3 py-1.5 bg-[#135D66] hover:bg-[#0f4a52] text-white text-sm font-medium rounded-lg disabled:opacity-40 transition-colors">
              Add
            </button>
            <button type="button" onClick={() => { setShowAddPicker(false); setPickedSlug(""); }}
              className="shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-sm rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        )}

        {/* Empty state */}
        {displayOverrides.length === 0 && !showAddPicker && (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            {autoPopulate
              ? <>No published locations in <strong>{item.reference}</strong> yet.</>
              : <>No locations selected. Use <strong>Add Location</strong> above.</>}
          </div>
        )}

        {/* Rows */}
        {displayOverrides.map((ov, idx) => {
          const dbItem     = cat?.items.find(i => i.slug === ov.slug);
          const dbTitle    = dbItem?.title ?? ov.slug;
          const derivedUrl = `/${ov.slug}`;

          return (
            <div key={ov.slug}
              className={`flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                ov.hidden ? "opacity-50 bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-800"
              }`}>

              {/* Reorder */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button type="button" onClick={() => moveOverride(ov.slug, -1)} disabled={idx === 0}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button type="button" onClick={() => moveOverride(ov.slug, 1)} disabled={idx === displayOverrides.length - 1}
                  className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Eye toggle (auto) / Remove button (manual) */}
              {autoPopulate ? (
                <button type="button" title={ov.hidden ? "Show in menu" : "Hide from menu"}
                  onClick={() => updateOverride(ov.slug, { hidden: !ov.hidden })}
                  className={`shrink-0 p-1.5 rounded-md transition-colors ${
                    ov.hidden ? "text-gray-300 hover:text-gray-500" : "text-[#135D66] hover:text-[#0f4a52]"
                  }`}>
                  {ov.hidden ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              ) : (
                <button type="button" title="Remove from menu" onClick={() => removeOverride(ov.slug)}
                  className="shrink-0 p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Slug (read-only) */}
              <span className="text-xs text-gray-400 font-mono w-36 shrink-0 truncate" title={ov.slug}>{ov.slug}</span>

              {/* Title override */}
              <input type="text" placeholder={`Title (default: ${dbTitle})`}
                value={ov.title}
                onChange={e => updateOverride(ov.slug, { title: e.target.value })}
                className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 outline-none" />

              {/* URL override */}
              <input type="text" placeholder={`URL (default: ${derivedUrl})`}
                value={ov.url}
                onChange={e => updateOverride(ov.slug, { url: e.target.value })}
                className="w-40 shrink-0 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 outline-none" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Custom item editor ───────────────────────────────────────────────────────

function CustomItemEditor({
  item, onChange,
}: {
  item:     NavConfigItem;
  onChange: (updated: NavConfigItem) => void;
}) {
  const subItems = item.subItems ?? [];

  const addSubItem = () =>
    onChange({ ...item, subItems: [...subItems, { id: genId(), name: "", url: "" }] });

  const updateSubItem = (id: string, field: "name" | "url", value: string) =>
    onChange({ ...item, subItems: subItems.map(s => s.id === id ? { ...s, [field]: value } : s) });

  const removeSubItem = (id: string) =>
    onChange({ ...item, subItems: subItems.filter(s => s.id !== id) });

  const moveSubItem = (id: string, dir: -1 | 1) => {
    const idx = subItems.findIndex(s => s.id === id);
    if (idx < 0) return;
    const next = [...subItems];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    const tmp = next[idx] as { id: string; name: string; url: string };
    next[idx] = next[swap] as { id: string; name: string; url: string };
    next[swap] = tmp;
    onChange({ ...item, subItems: next });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider w-28 shrink-0">Menu Title</label>
        <input type="text" placeholder="e.g. About Us" value={item.name ?? ""}
          onChange={e => onChange({ ...item, name: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm outline-none" />
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider w-28 shrink-0">Link URL</label>
        <input type="text" placeholder="e.g. /about" value={item.url ?? ""}
          onChange={e => onChange({ ...item, url: e.target.value })}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm outline-none" />
      </div>

      <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Dropdown Sub-items</span>
          <button type="button" onClick={addSubItem}
            className="text-xs font-bold text-adventure-600 hover:text-adventure-800">+ Add Sub-item</button>
        </div>

        {subItems.length === 0 && (
          <p className="px-4 py-4 text-xs text-gray-400">No sub-items — renders as a plain link.</p>
        )}

        {subItems.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0 bg-white dark:bg-gray-800">
            <div className="flex flex-col gap-0.5 shrink-0">
              <button type="button" onClick={() => moveSubItem(s.id, -1)} disabled={idx === 0}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button type="button" onClick={() => moveSubItem(s.id, 1)} disabled={idx === subItems.length - 1}
                className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <input type="text" placeholder="Name" value={s.name}
              onChange={e => updateSubItem(s.id, "name", e.target.value)}
              className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 outline-none" />
            <input type="text" placeholder="URL (e.g. /services/guide)" value={s.url}
              onChange={e => updateSubItem(s.id, "url", e.target.value)}
              className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 outline-none" />
            <button type="button" onClick={() => removeSubItem(s.id)}
              className="p-1.5 text-red-400 hover:text-red-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main settings page ───────────────────────────────────────────────────────

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving,  setIsSaving]  = useState(false);
  const [message,   setMessage]   = useState({ text: "", type: "" });

  // Footer state
  const [websiteInfo,   setWebsiteInfo]   = useState("");
  const [phoneNumber,   setPhoneNumber]   = useState("");
  const [email,         setEmail]         = useState("");
  const [address,       setAddress]       = useState("");
  const [socialLinks,   setSocialLinks]   = useState<LinkItem[]>([]);
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>([]);

  // Nav menu state
  const [headerMenu, setHeaderMenu] = useState<NavConfigItem[]>([]);
  const [navCats,    setNavCats]    = useState<NavCategory[]>([]);

  // Category picker UI state
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [pickedCat,     setPickedCat]     = useState("");

  // Expand/collapse per card
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Load settings + navigation in parallel ─────────────────────────────────
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL as string;
    Promise.all([
      fetch(`${base}/settings`).then(r => r.json()),
      fetch(`${base}/navigation`).then(r => r.json()),
    ])
      .then(([settingsRes, navRes]) => {
        if (settingsRes?.status === "success" && settingsRes.data) {
          const s = settingsRes.data;
          setWebsiteInfo(s.websiteInfo   ?? "");
          setPhoneNumber(s.phoneNumber   ?? "");
          setEmail(s.email               ?? "");
          setAddress(s.address           ?? "");
          setSocialLinks(parseJson(s.socialLinks,   []));
          setFooterColumns(parseJson(s.footerColumns, []));
          setHeaderMenu(migrateMenu(parseJson(s.headerMenu, [])));
        }
        if (Array.isArray(navRes?.data)) {
          setNavCats(navRes.data);
        }
      })
      .catch(err => console.error("[SettingsPage] load error:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // ── Nav item handlers ──────────────────────────────────────────────────────

  const addCategoryItem = () => {
    if (!pickedCat) return;
    if (headerMenu.some(i => i.type === "category" && i.reference === pickedCat)) {
      setShowCatPicker(false);
      setPickedCat("");
      return;
    }
    const newItem: NavConfigItem = {
      id: genId(), type: "category", order: headerMenu.length,
      reference: pickedCat, label: "", autoPopulate: true, subItemOverrides: [],
    };
    const next = reorder([...headerMenu, newItem]);
    setHeaderMenu(next);
    setExpandedId(newItem.id);
    setShowCatPicker(false);
    setPickedCat("");
  };

  const addCustomItem = () => {
    const newItem: NavConfigItem = {
      id: genId(), type: "custom", order: headerMenu.length,
      name: "", url: "", subItems: [],
    };
    setHeaderMenu(reorder([...headerMenu, newItem]));
    setExpandedId(newItem.id);
  };

  const removeItem = (id: string) => {
    setHeaderMenu(reorder(headerMenu.filter(i => i.id !== id)));
    if (expandedId === id) setExpandedId(null);
  };

  const moveItem = (id: string, dir: -1 | 1) => {
    const idx = headerMenu.findIndex(i => i.id === id);
    if (idx < 0) return;
    const next = [...headerMenu];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    const tmp = next[idx] as NavConfigItem;
    next[idx] = next[swap] as NavConfigItem;
    next[swap] = tmp;
    setHeaderMenu(reorder(next));
  };

  const updateItem = (updated: NavConfigItem) =>
    setHeaderMenu(headerMenu.map(i => i.id === updated.id ? updated : i));

  // ── Footer column handlers ─────────────────────────────────────────────────

  const addFooterColumn = () => setFooterColumns([...footerColumns, { title: "", links: [] }]);

  const updateColTitle = (idx: number, title: string) => {
    const n = [...footerColumns];
    if (n[idx]) { n[idx].title = title; setFooterColumns(n); }
  };

  const removeCol = (idx: number) => setFooterColumns(footerColumns.filter((_, i) => i !== idx));

  const addColLink = (ci: number) => {
    const n = [...footerColumns];
    if (n[ci]) { n[ci].links.push({ name: "", url: "" }); setFooterColumns(n); }
  };

  const updateColLink = (ci: number, li: number, field: "name" | "url", val: string) => {
    const n = [...footerColumns];
    if (n[ci] && n[ci].links[li]) { n[ci].links[li][field] = val; setFooterColumns(n); }
  };

  const removeColLink = (ci: number, li: number) => {
    const n = [...footerColumns];
    if (n[ci]) { n[ci].links = n[ci].links.filter((_, i) => i !== li); setFooterColumns(n); }
  };

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("adminToken");
      const res   = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body:    JSON.stringify({ websiteInfo, phoneNumber, email, address, socialLinks, footerColumns, headerMenu }),
      });
      const data = await res.json();
      setMessage(data.status === "success"
        ? { text: "Settings saved successfully!", type: "success" }
        : { text: data.message || "Failed to save settings.", type: "error" });
    } catch {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Settings…</div>;

  const usedCategories = new Set(headerMenu.filter(i => i.type === "category").map(i => i.reference));
  const availableCats  = navCats.filter(c => !usedCategories.has(c.category));

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20 max-w-6xl mx-auto">

      {/* Back */}
      <Link href="/admin"
        className="inline-flex items-center text-sm font-bold text-gray-400 hover:text-[#135D66] transition-colors mb-3 group">
        <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-4 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Global Content Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage header navigation and footer content.</p>
        </div>
        <button type="submit" disabled={isSaving}
          className="px-6 py-2.5 bg-adventure-600 hover:bg-adventure-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-70 transition-colors">
          {isSaving ? "Saving…" : "Save All Settings"}
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium border ${
          message.type === "error"
            ? "bg-red-50 text-red-600 border-red-200"
            : "bg-green-50 text-green-700 border-green-200"
        }`}>
          {message.text}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* HEADER NAVIGATION BUILDER                                             */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5 border-b border-gray-100 dark:border-gray-700 pb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Header Navigation</h3>
            <p className="text-xs text-gray-500 mt-1">
              <strong>Category items</strong> auto-populate from published Locations.&nbsp;
              <strong>Custom items</strong> are fully manual links.
            </p>
          </div>

          {/* Add buttons */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Add Category */}
            <div className="relative">
              <button type="button"
                onClick={() => { setShowCatPicker(v => !v); setPickedCat(""); }}
                className="px-3 py-2 bg-[#135D66] hover:bg-[#0f4a52] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Add Category
              </button>

              {showCatPicker && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 p-3 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Select a location category
                  </p>
                  {availableCats.length === 0 ? (
                    <p className="text-sm text-gray-400">
                      {navCats.length === 0
                        ? "No published locations found in the database."
                        : "All categories are already added."}
                    </p>
                  ) : (
                    <>
                      <select value={pickedCat} onChange={e => setPickedCat(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 outline-none">
                        <option value="">— choose category —</option>
                        {availableCats.map(c => (
                          <option key={c.category} value={c.category}>
                            {c.category} ({c.items.length} location{c.items.length !== 1 ? "s" : ""})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2 pt-1">
                        <button type="button" onClick={addCategoryItem} disabled={!pickedCat}
                          className="flex-1 px-3 py-1.5 bg-[#135D66] hover:bg-[#0f4a52] text-white text-sm rounded-lg disabled:opacity-50 transition-colors">
                          Add
                        </button>
                        <button type="button" onClick={() => setShowCatPicker(false)}
                          className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Add Custom */}
            <button type="button" onClick={addCustomItem}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Add Custom
            </button>
          </div>
        </div>

        {/* Items list */}
        <div className="space-y-3">
          {headerMenu.length === 0 && (
            <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              No menu items yet. Add a <strong>Category</strong> or <strong>Custom</strong> link above.
            </div>
          )}

          {headerMenu.map((item, idx) => {
            const isExpanded  = expandedId === item.id;
            const displayName = item.type === "category"
              ? (item.label?.trim() || item.reference || "Unnamed Category")
              : (item.name?.trim()  || "Unnamed Item");

            return (
              <div key={item.id} className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-visible">

                {/* Card header row */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button type="button" onClick={() => moveItem(item.id, -1)} disabled={idx === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button type="button" onClick={() => moveItem(item.id, 1)} disabled={idx === headerMenu.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Type badge */}
                  <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.type === "category"
                      ? "bg-[#135D66]/10 text-[#135D66]"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                  }`}>
                    {item.type === "category" ? "Category" : "Custom"}
                  </span>

                  {/* Name + expand toggle */}
                  <button type="button" onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex-1 flex items-center gap-2 text-left min-w-0">
                    <span className="font-medium text-gray-900 dark:text-white truncate">{displayName}</span>
                    {item.type === "category" && item.reference && item.label?.trim() && item.reference !== item.label.trim() && (
                      <span className="text-xs text-gray-400 truncate">({item.reference})</span>
                    )}
                    <svg className={`w-4 h-4 shrink-0 text-gray-400 transform transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Remove */}
                  <button type="button" onClick={() => removeItem(item.id)}
                    className="shrink-0 px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-sm font-medium transition-colors">
                    Remove
                  </button>
                </div>

                {/* Expanded editor */}
                {isExpanded && (
                  <div className="px-4 pb-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 rounded-b-xl">
                    {item.type === "category" ? (
                      <CategoryItemEditor item={item} navCats={navCats} onChange={updateItem} />
                    ) : (
                      <CustomItemEditor item={item} onChange={updateItem} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-800" />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FOOTER SETTINGS                                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">Footer Content</h3>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Description</label>
          <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none"
            value={websiteInfo} onChange={e => setWebsiteInfo(e.target.value)} placeholder="Brief description…" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
          <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none"
            value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+1 234 567 8900" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
          <input type="email" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none"
            value={email} onChange={e => setEmail(e.target.value)} placeholder="info@company.com" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Physical Address</label>
          <input type="text" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 outline-none"
            value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Main St…" />
        </div>
      </div>

      <SocialLinksBuilder list={socialLinks} setter={setSocialLinks} />

      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dynamic Footer Columns</h3>
            <p className="text-sm text-gray-500">Add custom link columns (e.g. Services, Legal, Resources).</p>
          </div>
          <button type="button" onClick={addFooterColumn}
            className="px-4 py-2 bg-adventure-100 text-adventure-700 hover:bg-adventure-200 font-medium rounded-lg text-sm transition-colors">
            + Add New Column
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {footerColumns.map((col, ci) => (
            <div key={ci} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm relative">
              <button type="button" onClick={() => removeCol(ci)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-sm font-medium">
                Remove Column
              </button>
              <div className="mb-4 pr-32">
                <input type="text" placeholder="Column Title (e.g. Explore)"
                  className="w-full px-3 py-2 border-b-2 border-gray-300 focus:border-adventure-600 dark:border-gray-600 bg-transparent text-lg font-bold outline-none"
                  value={col.title} onChange={e => updateColTitle(ci, e.target.value)} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-end mb-2">
                  <button type="button" onClick={() => addColLink(ci)}
                    className="text-sm font-medium text-adventure-600 hover:text-adventure-700">+ Add Link</button>
                </div>
                {col.links.map((link, li) => (
                  <div key={li} className="flex items-center gap-2">
                    <input type="text" placeholder="Name"
                      className="w-1/3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm outline-none"
                      value={link.name} onChange={e => updateColLink(ci, li, "name", e.target.value)} />
                    <input type="text" placeholder="URL"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm outline-none"
                      value={link.url} onChange={e => updateColLink(ci, li, "url", e.target.value)} />
                    <button type="button" onClick={() => removeColLink(ci, li)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {col.links.length === 0 && <p className="text-xs text-gray-400">No links in this column yet.</p>}
              </div>
            </div>
          ))}
        </div>
        {footerColumns.length === 0 && (
          <div className="text-center py-6 text-gray-500">No footer columns created.</div>
        )}
      </div>

    </form>
  );
}
