import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { TextureCards as TextureCardType } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Layers, LayoutGrid, Pen, TextAlignJustify } from "lucide-react";
import {
Select,
SelectContent,
SelectGroup,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import Card from "./Card";

interface TextureCardsProps {
textures: TextureCardType[];
}

const CARD_SIZE = 122;
const GAP = 12;
const ROW_SIZE = 138; // card size + gap + padding for hover effect

type EditFilter = "edited" | "unedited";
type ViewFilter = "card" | "list";
type SortBy = "name-asc" | "name-desc" | "edited-asc" | "edited-desc";

export default function TextureCards({ textures }: TextureCardsProps) {
const scrollRef = useRef<HTMLDivElement>(null);

const [search, setSearch] = useState("");
const [cols, setCols] = useState(1);
const [selectedCategory, setSelectedCategory] = useState("all");
const [editedTextures, setEditedTextures] = useState<Record<string, string>>({});
const [editFilter, setEditFilter] = useState<EditFilter>("unedited");
const [viewFilter, setViewFilter] = useState<ViewFilter>("card");
const [sortBy, setSortBy] = useState<SortBy>("name-asc");

const currentPackId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.pathname.split("/").pop() || "";
}, []);

const packs = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
    return JSON.parse(localStorage.getItem("packmc_packs") || "[]");
    } catch {
    return [];
    }
}, []);

const currentPackName = useMemo(
    () => packs.find((p: any) => p.id === currentPackId)?.name ?? "",
    [packs, currentPackId]
);

useEffect(() => {
    if (typeof window === "undefined") return;
    try {
    const edited = JSON.parse(localStorage.getItem("packmc_textures") || "{}");
    setEditedTextures(edited);
    } catch {
    setEditedTextures({});
    }
}, []);

const filteredTextures = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    let result = textures.filter((t) => {
    if (searchLower && !t.name.toLowerCase().includes(searchLower)) return false;

    if (selectedCategory !== "all" && t.category.split("/")[0] !== selectedCategory) {
        return false;
    }

    const isEdited = Boolean(editedTextures[`${t.category}/${t.filename}`]);

    if (editFilter === "edited" && !isEdited) return false;
    if (editFilter === "unedited" && isEdited) return false;

    return true;
    });

    result = [...result].sort((a, b) => {
    if (sortBy === "name-asc") return a.name.localeCompare(b.name);
    if (sortBy === "name-desc") return b.name.localeCompare(a.name);

    const aEdited = editedTextures[`${a.category}/${a.filename}`] ?? "";
    const bEdited = editedTextures[`${b.category}/${b.filename}`] ?? "";

    if (sortBy === "edited-asc") return aEdited.localeCompare(bEdited);
    return bEdited.localeCompare(aEdited);
    });

    return result;
}, [textures, search, selectedCategory, editedTextures, editFilter, sortBy]);

useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
    const width = el.clientWidth;
    const newCols = Math.max(1, Math.floor((width + GAP) / (CARD_SIZE + GAP)));
    setCols((prev) => (prev !== newCols ? newCols : prev));
    });

    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
}, []);

const rows = Math.ceil(filteredTextures.length / cols);

const virtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_SIZE,
    overscan: 2,
});

useEffect(() => {
    virtualizer.scrollToIndex(0);
    virtualizer.measure();
}, [cols, filteredTextures.length, virtualizer]);

return (
    <div className="flex h-full flex-row">
    <div>
        <div className="mb-6 flex items-center gap-3">
        <div className="bg-card flex h-8 w-8 items-center justify-center rounded-md">
            <Pen size={18} className="text-text-secondary" />
        </div>
        <div>
            <div className="text-text-secondary text-xs">EDITING...</div>
            <div className="text-sm text-text-primary-secondary">{currentPackName}</div>
        </div>
        </div>

        <div className="pr-2">
        <ToggleGroup
            variant="packmc"
            type="single"
            value={selectedCategory}
            onValueChange={(v) => v && setSelectedCategory(v)}
            className="flex flex-col items-start gap-2"
        >
            {[
            ["all", "ALL ASSETS"],
            ["item", "ITEMS"],
            ["block", "BLOCKS"],
            ["entity", "ENTITIES"],
            ["gui", "GUI"],
            ["effect", "EFFECTS"],
            ["painting", "PAINTINGS"],
            ["particle", "PARTICLE"],
            ["trims", "TRIMS"],
            ["font", "FONT"],
            ["map", "MAP ELEMENTS"],
            ["colormap", "COLORMAP"],
            ["misc", "MISC"],
            ].map(([value, label]) => (
            <ToggleGroupItem key={value} value={value} className="group gap-1.5">
                <LayoutGrid className="hidden size-4 group-data-[state=on]:block" />
                <Layers className="hidden size-4 group-data-[state=off]:block" />
                {label}
            </ToggleGroupItem>
            ))}
        </ToggleGroup>
        </div>
    </div>

    <div className="w-full px-4">
        <div className="flex flex-col">
        <span className="text-text-primary-secondary drop-shadow-[0_0_8px_rgba(204,151,255,0.2)] text-6xl font-bold">
            Texture Browser
        </span>

        <div className="flex items-center gap-2 py-2">
            <input
            type="text"
            placeholder="Search textures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full flex-1 rounded-md border-2 border-zinc-800 bg-neutral-900 p-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="ml-auto flex gap-2">
            <ToggleGroup
                variant="packmc"
                type="single"
                value={viewFilter}
                onValueChange={(v) => v && setViewFilter(v as ViewFilter)}
                className="border-2 border-zinc-800 bg-neutral-900 text-zinc-300"
            >
                <ToggleGroupItem value="card" className="gap-1.5">
                <LayoutGrid size={18} />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" className="gap-1.5">
                <TextAlignJustify size={18} />
                </ToggleGroupItem>
            </ToggleGroup>

            <ToggleGroup
                variant="packmc"
                type="single"
                value={editFilter}
                onValueChange={(v) => v && setEditFilter(v as EditFilter)}
                className="border-2 border-zinc-800 bg-neutral-900 text-zinc-300"
            >
                <ToggleGroupItem value="edited" className="gap-1.5">
                Edited
                </ToggleGroupItem>
                <ToggleGroupItem value="unedited" className="gap-1.5">
                Unedited
                </ToggleGroupItem>
            </ToggleGroup>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortBy)}>
                <SelectTrigger
                className="w-full border-2 border-zinc-800 bg-neutral-900 text-sm text-zinc-300"
                size="default"
                >
                <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                <SelectGroup>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="edited-asc">Edited (Oldest)</SelectItem>
                    <SelectItem value="edited-desc">Edited (Newest)</SelectItem>
                </SelectGroup>
                </SelectContent>
            </Select>
            </div>
        </div>
        </div>

        <div ref={scrollRef} className="relative h-full overflow-auto
                                        [scrollbar-width:none] [-ms-overflow-style:none]
                                        &::-webkit-scrollbar]:hidden"
        >
        {filteredTextures.length === 0 ? (
            <div className="flex h-48 w-full items-center justify-center rounded-md border-2 border-dashed border-neutral-800">
            <span className="text-sm text-neutral-500">No textures found.</span>
            </div>
        ) : (
            <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualRow) => {
                const startIndex = virtualRow.index * cols;
                const endIndex = Math.min(startIndex + cols, filteredTextures.length);
                const rowTextures = filteredTextures.slice(startIndex, endIndex);

                return (
                <div
                    key={virtualRow.index}
                    style={{
                    position: "absolute",
                    top: virtualRow.start,
                    left: 0,
                    width: "100%",
                    height: ROW_SIZE,
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: GAP,
                    }}
                >
                    {rowTextures.map((texture) => (
                    <Card key={`${texture.category}/${texture.filename}`} texture={texture} />
                    ))}
                </div>
                );
            })}
            </div>
        )}
        </div>
    </div>
    </div>
);
}