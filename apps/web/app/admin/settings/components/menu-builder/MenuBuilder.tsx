"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToWindowEdges } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  type DragProjection,
  type MenuTreeCategory,
  type NavConfigItem,
  type StructureNode,
  addCustomItem,
  addPickerSelections,
  buildStructureNodes,
  dragRebuild,
  genId,
  isCategoryInMenu,
  isLocationInMenu,
  moveCustomItemToParent,
  moveNestedCustomToParent,
  moveStructureNode,
  projectDrag,
  promoteLocationToTopLevel,
  removeStructureNode,
  reorder,
  updateNavItem,
  updateStructureLabel,
  updateStructureUrl,
} from "../../../../../lib/menuBuilder";

const INDENT_PX = 28;

interface Props {
  headerMenu: NavConfigItem[];
  setHeaderMenu: (items: NavConfigItem[]) => void;
  menuTree: MenuTreeCategory[];
}

function typeLabel(type: StructureNode["type"]): string {
  const map: Record<StructureNode["type"], string> = {
    category: "Category",
    location: "Location",
    package: "Package",
    custom: "Custom Link",
    "custom-sub": "Sub Item",
  };
  return map[type] ?? type;
}

function CategoryItemEditor({
  item,
  menuTree,
  onChange,
}: {
  item: NavConfigItem;
  menuTree: MenuTreeCategory[];
  onChange: (updated: NavConfigItem) => void;
}) {
  const catTree = menuTree.find((c) => c.category === item.reference);
  const autoPopulate = item.autoPopulate !== false;

  const toggleAutoPopulate = () => {
    if (autoPopulate) {
      const seed = (item.subItemOverrides ?? []).filter(
        (o) => !o.hidden && o.itemType !== "package",
      );
      onChange({ ...item, autoPopulate: false, subItemOverrides: seed });
    } else {
      onChange({ ...item, autoPopulate: true });
    }
  };

  return (
    <div className="space-y-4 pt-1">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Navigation Label</label>
        <input
          type="text"
          placeholder={item.reference ?? "Category name"}
          value={item.label ?? ""}
          onChange={(e) => onChange({ ...item, label: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66]/30"
        />
      </div>
      <div>
        <span className="block text-xs text-gray-500 mb-1">
          Source: <strong>{item.reference}</strong>
          {catTree && ` · ${catTree.locations.length} location${catTree.locations.length !== 1 ? "s" : ""}`}
        </span>
      </div>
      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
        <button
          type="button"
          role="switch"
          aria-checked={autoPopulate}
          onClick={toggleAutoPopulate}
          className={`relative shrink-0 mt-0.5 w-10 h-5 rounded-full transition-colors ${
            autoPopulate ? "bg-[#135D66]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
              autoPopulate ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {autoPopulate ? "Auto-populate all locations" : "Manual selection only"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {autoPopulate
              ? "All published locations appear automatically. Hidden items stay excluded."
              : "Only locations and packages you add from the left panel are shown."}
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomItemEditor({
  item,
  onChange,
}: {
  item: NavConfigItem;
  onChange: (updated: NavConfigItem) => void;
}) {
  const subItems = item.subItems ?? [];

  return (
    <div className="space-y-4 pt-1">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Navigation Label</label>
        <input
          type="text"
          placeholder="e.g. About Us"
          value={item.name ?? ""}
          onChange={(e) => onChange({ ...item, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66]/30"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL</label>
        <input
          type="text"
          placeholder="e.g. /about"
          value={item.url ?? ""}
          onChange={(e) => onChange({ ...item, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66]/30"
        />
      </div>
      {subItems.length > 0 && (
        <p className="text-xs text-gray-500">{subItems.length} dropdown sub-item(s) configured.</p>
      )}
    </div>
  );
}

interface SortableRowRenderProps {
  setNodeRef: (el: HTMLElement | null) => void;
  style: React.CSSProperties;
  isDragging: boolean;
  dragHandleProps: Record<string, unknown>;
}

function SortableRow({
  nodeKey,
  isDisabled,
  children,
}: {
  nodeKey: string;
  isDisabled?: boolean;
  children: (renderProps: SortableRowRenderProps) => React.ReactNode;
}) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({
    id: nodeKey,
    disabled: isDisabled,
  });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const dragHandleProps = { ...attributes, ...listeners } as Record<string, unknown>;
  return <>{children({ setNodeRef, style, isDragging, dragHandleProps })}</>;
}

export default function MenuBuilder({ headerMenu, setHeaderMenu, menuTree }: Props) {
  const [pickerOpen, setPickerOpen] = useState(true);
  const [customOpen, setCustomOpen] = useState(false);
  const [expandedPickerCategory, setExpandedPickerCategory] = useState<string | null>(null);
  const [pickerSelections, setPickerSelections] = useState<{
    includeCategory: boolean;
    locationSlugs: Set<string>;
  }>({ includeCategory: false, locationSlugs: new Set() });
  const [expandedNodeKey, setExpandedNodeKey] = useState<string | null>(null);
  /** Parent groups (category/custom) whose child rows are hidden */
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeDragKey, setActiveDragKey] = useState<string | null>(null);
  const [overDragKey, setOverDragKey] = useState<string | null>(null);
  const [dragOffsetX, setDragOffsetX] = useState<number>(0);
  const [customName, setCustomName] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [pickerMessage, setPickerMessage] = useState("");

  const structure = useMemo(
    () => buildStructureNodes(headerMenu, menuTree),
    [headerMenu, menuTree],
  );

  const groupKeyFor = (node: StructureNode) =>
    node.type === "category" ? `cat-${node.navItemId}` : `custom-${node.navItemId}`;

  const isGroupCollapsed = (node: StructureNode) =>
    (node.type === "category" || node.type === "custom") && collapsedGroups.has(groupKeyFor(node));

  const isChildVisible = (node: StructureNode) => {
    if (node.depth === 0) return true;
    if (node.type === "location") return !collapsedGroups.has(`cat-${node.navItemId}`);
    if (node.type === "custom-sub") return !collapsedGroups.has(`custom-${node.navItemId}`);
    return true;
  };

  const visibleStructure = useMemo(
    () => structure.filter(isChildVisible),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- collapsedGroups drives visibility
    [structure, collapsedGroups],
  );

  const childCountFor = (node: StructureNode) =>
    structure.filter(
      (n) =>
        n.depth > 0 &&
        n.navItemId === node.navItemId &&
        ((node.type === "category" && n.type === "location") ||
          (node.type === "custom" && n.type === "custom-sub")),
    ).length;

  const toggleStructureNode = (node: StructureNode) => {
    if (node.type === "category" || node.type === "custom") {
      const gKey = groupKeyFor(node);
      if (collapsedGroups.has(gKey)) {
        setCollapsedGroups((prev) => {
          const next = new Set(prev);
          next.delete(gKey);
          return next;
        });
        setExpandedNodeKey(node.key);
      } else {
        setCollapsedGroups((prev) => new Set(prev).add(gKey));
        setExpandedNodeKey((current) => {
          if (!current) return null;
          const open = structure.find((n) => n.key === current);
          if (current === node.key || open?.navItemId === node.navItemId) return null;
          return current;
        });
      }
    } else {
      setExpandedNodeKey((current) => (current === node.key ? null : node.key));
    }
  };

  const resetPickerSelections = () => {
    setPickerSelections({ includeCategory: false, locationSlugs: new Set() });
  };

  const togglePickerCategory = (category: string) => {
    if (expandedPickerCategory === category) {
      setExpandedPickerCategory(null);
      resetPickerSelections();
    } else {
      setExpandedPickerCategory(category);
      resetPickerSelections();
    }
    setPickerMessage("");
  };

  const toggleLocationSelection = (slug: string) => {
    setPickerSelections((prev) => {
      const next = new Set(prev.locationSlugs);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return { ...prev, locationSlugs: next };
    });
  };

  const handleAddPickerToMenu = () => {
    if (!expandedPickerCategory) return;
    const hasSelection =
      pickerSelections.includeCategory || pickerSelections.locationSlugs.size > 0;

    if (!hasSelection) {
      setPickerMessage("Select a category or location first.");
      return;
    }

    setHeaderMenu(
      addPickerSelections(headerMenu, menuTree, expandedPickerCategory, {
        includeCategory: pickerSelections.includeCategory,
        locationSlugs: [...pickerSelections.locationSlugs],
      }),
    );
    setPickerMessage("Added to menu.");
    resetPickerSelections();
    setTimeout(() => setPickerMessage(""), 2500);
  };

  const handleAddCustom = () => {
    const name = customName.trim();
    const url = customUrl.trim();
    if (!name) {
      setPickerMessage("Custom link text is required.");
      return;
    }
    const focused = structure.find((n) => n.key === expandedNodeKey);
    const focusedNavId = focused?.navItemId;
    const focusedTopLevelId = focusedNavId
      ? headerMenu.find((i) => i.id === focusedNavId)?.id
      : undefined;

    // If a custom group (or its child) is focused, create a sub-item under it.
    const focusedCustomParent =
      focused && (focused.type === "custom" || focused.type === "custom-sub")
        ? headerMenu.find((i) => i.id === focused.navItemId && i.type === "custom")
        : null;

    let nextMenu: NavConfigItem[];
    let newItemId: string | null = null;

    if (focusedCustomParent) {
      nextMenu = headerMenu.map((item) =>
        item.id === focusedCustomParent.id
          ? {
              ...item,
              subItems: [...(item.subItems ?? []), { id: genId(), name, url: url || "#" }],
            }
          : item,
      );
      setExpandedNodeKey(`custom-${focusedCustomParent.id}`);
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        next.delete(`custom-${focusedCustomParent.id}`);
        return next;
      });
      setPickerMessage(`Added "${name}" as a sub-item under ${focusedCustomParent.name || "custom link"}.`);
    } else {
      const newItem: NavConfigItem = {
        id: genId(),
        type: "custom",
        order: headerMenu.length,
        name,
        url: url || "#",
        subItems: [],
      };
      newItemId = newItem.id;

      if (focusedTopLevelId) {
        const insertIdx = headerMenu.findIndex((i) => i.id === focusedTopLevelId);
        if (insertIdx >= 0) {
          nextMenu = reorder([
            ...headerMenu.slice(0, insertIdx + 1),
            newItem,
            ...headerMenu.slice(insertIdx + 1),
          ]);
        } else {
          nextMenu = reorder([...headerMenu, newItem]);
        }
      } else {
        nextMenu = addCustomItem(headerMenu);
        const created = nextMenu[nextMenu.length - 1];
        nextMenu = reorder(nextMenu.map((i) => (i.id === created?.id ? { ...i, name, url: url || "#" } : i)));
        newItemId = created?.id ?? null;
      }

      if (newItemId) {
        setCollapsedGroups((prev) => {
          const next = new Set(prev);
          next.delete(`custom-${newItemId}`);
          return next;
        });
        setExpandedNodeKey(`custom-${newItemId}`);
      }
      setPickerMessage(
        focusedTopLevelId
          ? `Added "${name}" below selected menu item.`
          : `Added "${name}" to the end of menu.`,
      );
    }

    setHeaderMenu(nextMenu);
    setCustomName("");
    setCustomUrl("");
    setTimeout(() => setPickerMessage(""), 2500);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const projection: DragProjection | null = useMemo(() => {
    if (!activeDragKey || !overDragKey || activeDragKey === overDragKey) return null;
    return projectDrag(headerMenu, menuTree, activeDragKey, overDragKey, dragOffsetX, INDENT_PX);
  }, [activeDragKey, overDragKey, dragOffsetX, headerMenu, menuTree]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragKey(String(event.active.id));
    setOverDragKey(null);
    setDragOffsetX(0);
    setExpandedNodeKey(null);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    setDragOffsetX(event.delta.x);
    const newOver = event.over ? String(event.over.id) : null;
    setOverDragKey(newOver);
    if (newOver) {
      // Auto-expand collapsed groups when hovering over their parent row.
      const node = structure.find((n) => n.key === newOver);
      if (
        node &&
        (node.type === "category" || node.type === "custom") &&
        collapsedGroups.has(groupKeyFor(node))
      ) {
        setCollapsedGroups((prev) => {
          const next = new Set(prev);
          next.delete(groupKeyFor(node));
          return next;
        });
      }
    }
  };

  const handleDragCancel = () => {
    setActiveDragKey(null);
    setOverDragKey(null);
    setDragOffsetX(0);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    const delta = event.delta.x;

    setActiveDragKey(null);
    setOverDragKey(null);
    setDragOffsetX(0);

    if (!overId || overId === activeId) return;
    const proj = projectDrag(headerMenu, menuTree, activeId, overId, delta, INDENT_PX);
    if (!proj.allowed) return;
    setHeaderMenu(dragRebuild(headerMenu, menuTree, activeId, overId, proj));
  };

  const closeExpanded = (node?: StructureNode) => {
    const target = node ?? structure.find((n) => n.key === expandedNodeKey);
    if (target && (target.type === "category" || target.type === "custom")) {
      setCollapsedGroups((prev) => new Set(prev).add(groupKeyFor(target)));
    }
    setExpandedNodeKey(null);
  };

  const handleRemove = (node: StructureNode) => {
    setHeaderMenu(removeStructureNode(headerMenu, node));
    if (expandedNodeKey === node.key) setExpandedNodeKey(null);
    if (node.type === "category" || node.type === "custom") {
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        next.delete(groupKeyFor(node));
        return next;
      });
    }
  };

  const updateItem = (updated: NavConfigItem) =>
    setHeaderMenu(updateNavItem(headerMenu, updated));

  const parentOptions = useMemo(() => {
    const categories = structure.filter((n) => n.type === "category" && n.depth === 0);
    const customs = structure.filter((n) => n.type === "custom" && n.depth === 0);
    return { categories, customs };
  }, [structure]);

  const handleMoveCustomParent = (customId: string, value: string) => {
    if (value === "root") {
      setHeaderMenu(moveCustomItemToParent(headerMenu, customId, { type: "root" }));
      return;
    }
    if (value.startsWith("cat:")) {
      const id = value.slice(4);
      if (!id) return;
      setHeaderMenu(moveCustomItemToParent(headerMenu, customId, { type: "category", id }));
      setExpandedNodeKey(`cat-${id}`);
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        next.delete(`cat-${id}`);
        return next;
      });
      return;
    }
    if (value.startsWith("custom:")) {
      const id = value.slice(7);
      if (!id || id === customId) return;
      setHeaderMenu(moveCustomItemToParent(headerMenu, customId, { type: "custom", id }));
      setExpandedNodeKey(`custom-${id}`);
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        next.delete(`custom-${id}`);
        return next;
      });
    }
  };

  const handleMoveNestedCustomParent = (node: StructureNode, value: string) => {
    const source =
      node.editTarget === "override" && node.overrideSlug
        ? { categoryId: node.navItemId, overrideSlug: node.overrideSlug }
        : node.editTarget === "custom-sub" && node.subItemId
          ? { customParentId: node.navItemId, subItemId: node.subItemId }
          : null;
    if (!source) return;

    let target: { type: "root" } | { type: "category"; id: string } | { type: "custom"; id: string } | null =
      null;

    if (value === "root") target = { type: "root" };
    else if (value.startsWith("cat:")) {
      const id = value.slice(4);
      if (id && id !== node.navItemId) target = { type: "category", id };
    } else if (value.startsWith("custom:")) {
      const id = value.slice(7);
      if (id && id !== node.navItemId) target = { type: "custom", id };
    }

    if (!target) return;
    setHeaderMenu(moveNestedCustomToParent(headerMenu, source, target));
    setExpandedNodeKey(null);
  };

  /** Current parent value for nested custom item dropdown */
  const nestedCustomParentValue = (node: StructureNode) => {
    if (node.editTarget === "override") return `cat:${node.navItemId}`;
    if (node.editTarget === "custom-sub") return `custom:${node.navItemId}`;
    return "root";
  };

  const isCustomChildEditor = (node: StructureNode) => node.type === "custom-sub";

  const canPromoteToTop = (node: StructureNode) =>
    node.depth > 0 && (node.type === "custom-sub" || node.type === "location");

  const handlePromoteToTop = (node: StructureNode) => {
    if (node.type === "custom-sub") {
      handleMoveNestedCustomParent(node, "root");
      return;
    }
    if (node.type === "location" && node.slug) {
      setHeaderMenu(
        promoteLocationToTopLevel(
          headerMenu,
          node.navItemId,
          node.slug,
          node.label,
          node.url ?? `/${node.slug}`,
        ),
      );
      setExpandedNodeKey(null);
    }
  };

  const renderStructureRow = (node: StructureNode) => {
    const isParent = node.type === "category" || node.type === "custom";
    const groupOpen = isParent ? !isGroupCollapsed(node) : true;
    const isExpanded = expandedNodeKey === node.key && groupOpen;
    const navItem = headerMenu.find((i) => i.id === node.navItemId);
    const isBeingDragged = activeDragKey === node.key;
    // The active row shows the projected indent while dragging; other rows keep their own depth.
    const projectedActiveDepth =
      isBeingDragged && projection ? projection.depth : null;
    const indent = (projectedActiveDepth ?? node.depth) * INDENT_PX;
    const showProjection =
      overDragKey === node.key &&
      activeDragKey !== null &&
      activeDragKey !== node.key &&
      projection !== null;
    const childCount = isParent ? childCountFor(node) : 0;

    return (
      <SortableRow
        key={node.key}
        nodeKey={node.key}
        isDisabled={false}
      >
        {({ dragHandleProps, setNodeRef, style, isDragging }) => (
          <div
            ref={setNodeRef}
            style={style}
            className={`w-full min-w-0 ${isDragging ? "opacity-30" : ""}`}
          >
            <div
              className={`w-full min-w-0 border bg-white transition-all ${
                isExpanded
                  ? "border-[#135D66]/40 shadow-sm rounded-t-md"
                  : showProjection && projection?.allowed
                    ? "border-[#135D66] bg-[#135D66]/5 rounded-md ring-2 ring-[#135D66]/30"
                    : showProjection && projection?.allowed === false
                      ? "border-red-400 bg-red-50 rounded-md"
                      : "border-gray-200 rounded-md hover:border-gray-300"
              } ${isBeingDragged ? "ring-2 ring-[#135D66]/40" : ""}`}
              style={{
                marginLeft: indent,
                width: indent > 0 ? `calc(100% - ${indent}px)` : "100%",
                transition: "margin-left 120ms ease, width 120ms ease",
              }}
            >
              <div className="flex items-center gap-2 px-3 py-2.5 min-w-0">
                <button
                  type="button"
                  {...dragHandleProps}
                  className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0 select-none text-lg leading-none touch-none"
                  title="Drag to reorder (or use keyboard: Space, arrows, Space)"
                  aria-label={`Drag ${node.label}`}
                >
                  ≡
                </button>

                <button
                  type="button"
                  onClick={() => toggleStructureNode(node)}
                  className="flex-1 flex items-center justify-between gap-2 text-left min-w-0"
                  aria-expanded={isParent ? groupOpen : isExpanded}
                >
                  <div className="min-w-0">
                    <span className="block font-medium text-gray-900 truncate text-sm">{node.label}</span>
                    <span className="block text-[11px] text-gray-400 truncate">
                      {typeLabel(node.type)}
                      {node.reference && node.type === "category" ? ` · ${node.reference}` : ""}
                      {isParent && !groupOpen && childCount > 0
                        ? ` · ${childCount} sub-item${childCount !== 1 ? "s" : ""}`
                        : ""}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                      (isParent ? groupOpen : isExpanded) ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Expanded panel — only when open */}
              {isExpanded ? (
            <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
              {(node.editTarget === "category" || node.editTarget === "custom") && navItem && (
                <>
                  {node.editTarget === "category" ? (
                    <CategoryItemEditor item={navItem} menuTree={menuTree} onChange={updateItem} />
                  ) : (
                    <>
                      <CustomItemEditor item={navItem} onChange={updateItem} />
                      <div className="pt-3 border-t border-gray-200 mt-3">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Parent Menu Item
                        </label>
                        <select
                          key={`parent-${navItem.id}`}
                          defaultValue="root"
                          onChange={(e) => {
                            handleMoveCustomParent(navItem.id, e.target.value);
                            e.target.value = "root";
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66]/30"
                        >
                          <option value="root">Main Menu (Top level)</option>
                          {parentOptions.categories.map((cat) => (
                            <option key={cat.navItemId} value={`cat:${cat.navItemId}`}>
                              Under Category: {cat.label}
                            </option>
                          ))}
                          {parentOptions.customs
                            .filter((n) => n.navItemId !== navItem.id)
                            .map((custom) => (
                              <option key={custom.navItemId} value={`custom:${custom.navItemId}`}>
                                Under Custom Link: {custom.label}
                              </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1.5">
                          Choose a parent to move this custom link without dragging.
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              {(node.editTarget === "override" || node.editTarget === "custom-sub") && (
                <div className="space-y-4 pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Navigation Label
                    </label>
                    <input
                      type="text"
                      value={
                        node.label === "Unnamed Sub-link" || node.label === "Unnamed Link" ? "" : node.label
                      }
                      onChange={(e) =>
                        setHeaderMenu(updateStructureLabel(headerMenu, node, e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">URL</label>
                    <input
                      type="text"
                      value={node.url ?? ""}
                      onChange={(e) =>
                        setHeaderMenu(updateStructureUrl(headerMenu, node, e.target.value))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66]/30"
                    />
                  </div>
                  {node.slug && (
                    <p className="text-xs text-gray-400 font-mono truncate" title={node.slug}>
                      Slug: {node.slug}
                    </p>
                  )}

                  {isCustomChildEditor(node) && (
                    <div className="pt-3 border-t border-gray-200">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Parent Menu Item
                      </label>
                      <select
                        value={nestedCustomParentValue(node)}
                        onChange={(e) => handleMoveNestedCustomParent(node, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66] focus:ring-1 focus:ring-[#135D66]/30"
                      >
                        <option value="root">Main Menu (Top level)</option>
                        {parentOptions.categories.map((cat) => (
                          <option key={cat.navItemId} value={`cat:${cat.navItemId}`}>
                            Under Category: {cat.label}
                          </option>
                        ))}
                        {parentOptions.customs
                          .filter((n) => n.navItemId !== node.navItemId)
                          .map((custom) => (
                            <option key={custom.navItemId} value={`custom:${custom.navItemId}`}>
                              Under Custom Link: {custom.label}
                            </option>
                          ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1.5">
                        Move this link to top-level or under a different parent.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* WordPress-style actions */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleRemove(node)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
                {canPromoteToTop(node) && (
                  <button
                    type="button"
                    onClick={() => handlePromoteToTop(node)}
                    className="text-sm text-[#135D66] hover:text-[#0f4a52] font-medium"
                    title="Move out of its parent and place as a top-level menu item"
                  >
                    Move to Top Level
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => closeExpanded(node)}
                  className="text-sm text-[#135D66] hover:text-[#0f4a52] font-medium"
                >
                  Close
                </button>
                <span className="text-gray-200">|</span>
                <button
                  type="button"
                  onClick={() => setHeaderMenu(moveStructureNode(headerMenu, menuTree, node.key, -1))}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Move up
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderMenu(moveStructureNode(headerMenu, menuTree, node.key, 1))}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Move down
                </button>
              </div>
            </div>
          ) : null}
            </div>
          </div>
        )}
      </SortableRow>
    );
  };

  const pickerCount =
    (pickerSelections.includeCategory ? 1 : 0) + pickerSelections.locationSlugs.size;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,360px)_1fr] gap-6 w-full max-w-full overflow-hidden">
      {/* ── Left: Add menu items ── */}
      <div className="space-y-3 min-w-0">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Add Menu Items</h4>

        {/* Categories picker */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
          >
            Categories
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${pickerOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {pickerOpen && (
            <div className="border-t border-gray-100">
              {menuTree.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-400 text-center">No published categories found.</p>
              ) : (
                <ul className="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                  {menuTree.map((cat) => {
                    const isExpanded = expandedPickerCategory === cat.category;
                    const inMenu = isCategoryInMenu(headerMenu, cat.category);

                    return (
                      <li key={cat.category}>
                        {/* Category row */}
                        <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            id={`cat-${cat.slug}`}
                            checked={isExpanded && pickerSelections.includeCategory}
                            disabled={inMenu}
                            onChange={() => {
                              if (!isExpanded) {
                                setExpandedPickerCategory(cat.category);
                                setPickerSelections({
                                  includeCategory: true,
                                  locationSlugs: new Set(),
                                });
                              } else {
                                setPickerSelections((prev) => ({
                                  ...prev,
                                  includeCategory: !prev.includeCategory,
                                }));
                              }
                            }}
                            className="shrink-0 rounded border-gray-300 text-[#135D66] focus:ring-[#135D66]"
                            title={inMenu ? "Already in menu" : "Add category to menu"}
                          />
                          <button
                            type="button"
                            onClick={() => togglePickerCategory(cat.category)}
                            className="flex-1 flex items-center justify-between text-left min-w-0"
                          >
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {cat.category}
                              {inMenu && (
                                <span className="ml-2 text-[10px] font-normal text-green-600">(in menu)</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400 shrink-0 ml-2">
                              {cat.locations.length} loc.
                            </span>
                          </button>
                        </div>

                        {/* Locations + packages for expanded category */}
                        {isExpanded && (
                          <div className="bg-gray-50/80 border-t border-gray-100 px-3 py-2 space-y-1">
                            {cat.locations.length === 0 ? (
                              <p className="text-xs text-gray-400 py-2 pl-6">No published locations.</p>
                            ) : (
                              cat.locations.map((loc) => {
                                const locInMenu = isLocationInMenu(headerMenu, cat.category, loc.slug);
                                const locSelected = pickerSelections.locationSlugs.has(loc.slug);

                                return (
                                  <div key={loc.slug} className="pl-4">
                                    <label className="flex items-center gap-2 py-1.5 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        checked={locSelected}
                                        disabled={locInMenu}
                                        onChange={() => toggleLocationSelection(loc.slug)}
                                        className="rounded border-gray-300 text-[#135D66] focus:ring-[#135D66]"
                                      />
                                      <span
                                        className={`text-sm truncate ${
                                          locInMenu ? "text-gray-400" : "text-gray-700 group-hover:text-gray-900"
                                        }`}
                                      >
                                        {loc.title}
                                        {locInMenu && (
                                          <span className="text-[10px] text-green-600 ml-1">(added)</span>
                                        )}
                                      </span>
                                    </label>
                                  </div>
                                );
                              })
                            )}

                            <button
                              type="button"
                              onClick={handleAddPickerToMenu}
                              disabled={pickerCount === 0}
                              className="w-full mt-2 px-3 py-2 bg-[#135D66] hover:bg-[#0f4a52] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Add to Menu{pickerCount > 0 ? ` (${pickerCount})` : ""}
                            </button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Custom links */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition-colors"
          >
            Custom Links
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${customOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {customOpen && (
            <div className="p-4 space-y-3 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Link Text</label>
                <input
                  type="text"
                  placeholder="e.g. About Us"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">URL</label>
                <input
                  type="text"
                  placeholder="e.g. /about"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#135D66]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustom}
                className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg"
              >
                Add to Menu
              </button>
            </div>
          )}
        </div>

        {pickerMessage && (
          <p className="text-xs text-gray-500 px-1">{pickerMessage}</p>
        )}
      </div>

      {/* ── Right: Menu Structure ── */}
      <div className="min-w-0 flex flex-col">
        <div className="flex items-center justify-between mb-3 gap-2">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Menu Structure</h4>
          <p className="text-[11px] text-gray-400 shrink-0">
            Drag ≡ to reorder · drag right to nest · keyboard: Space + arrows
          </p>
        </div>

        <div className="flex-1 min-w-0 overflow-x-auto overflow-y-visible">
          {structure.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <p className="text-sm">Your menu is empty.</p>
              <p className="text-xs mt-1">Select categories and locations from the left, then click Add to Menu.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={visibleStructure.map((n) => n.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5 min-w-0 pr-1">
                  {visibleStructure.map((node) => renderStructureRow(node))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeDragKey ? (
                  <div
                    className={`bg-white shadow-xl rounded-md px-3 py-2.5 max-w-md border-2 ${
                      projection
                        ? projection.allowed
                          ? "border-[#135D66]"
                          : "border-red-400"
                        : "border-[#135D66]/40"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-gray-400 text-lg leading-none">≡</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {structure.find((n) => n.key === activeDragKey)?.label ?? "Dragging…"}
                        </p>
                        <p
                          className={`text-[11px] truncate ${
                            projection
                              ? projection.allowed
                                ? "text-[#135D66]"
                                : "text-red-500"
                              : "text-gray-400"
                          }`}
                        >
                          {projection
                            ? projection.allowed
                              ? projection.parentLabel
                                ? `→ Drop under: ${projection.parentLabel}`
                                : "→ Drop as top-level item"
                              : "✗ Drop not allowed here"
                            : "Drag to reorder or nest"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
