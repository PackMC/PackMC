import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Pen, Trash } from "lucide-react";

interface TextureCards {
    name: string;
    category: string;
    filename: string;
    url: string;
    width: number;
    height: number;
    aspect_ratio: string;
}

interface TextureCardsProps {
    textures: TextureCards[];
}

const CARD = 86;
const GAP = 0;
const ROW = CARD + GAP;

export default function TextureCards({ textures }: TextureCardsProps) {
    const navigate = useNavigate();

    const scrollRef = useRef<HTMLDivElement>(null);

    const [search, setSearch] = useState("");
    const [cols, setCols] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [hoveredTexture, setHoveredTexture] = useState<string | null>(null);
    const [editedTextures, setEditedTextures] = useState<Record<string, string>>({});
    const [editFilter, setEditFilter] = useState<"all" | "Edited" | "Unedited">("all");
    const [tooltip, setTooltip] = useState<{ name: string; category: string; x: number; y: number } | null>(null);

    const searchLower = search.toLowerCase();

    const filteredTextures = useMemo(() => {
        let result = textures;

        if (searchLower) {
            result = result.filter(t => t.name.toLowerCase().includes(searchLower));
        }

        if (selectedCategories.length > 0) {
            result = result.filter(t => selectedCategories.includes(t.category.split("/")[0]));
        }

        if (editFilter === "Edited") {
            result = result.filter(t => editedTextures[t.category + "/" + t.filename]);
        } else if (editFilter === "Unedited") {
            result = result.filter(t => !editedTextures[t.category + "/" + t.filename]);
        }

        result = result.sort((a, b) => a.name.localeCompare(b.name));

        return result;
    }, [textures, searchLower, selectedCategories, editedTextures, editFilter]);

    const rows = Math.ceil(filteredTextures.length / cols);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const resizeObserver = new ResizeObserver(() => {
            const width = el.clientWidth;
            const newCols = Math.max(1, Math.floor((width + GAP) / (CARD + GAP)));
            setCols(prev => prev !== newCols ? newCols : prev);
        });

        resizeObserver.observe(el);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const edited = JSON.parse(localStorage.getItem("packmc_textures") || "{}");
        setEditedTextures(edited);
    }, []);

    const virtualizer = useVirtualizer({
        count: rows,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => ROW,
        overscan: 4,
    });

    useEffect(() => {
        virtualizer.scrollToIndex(0);
        virtualizer.measure();
    }, [cols, filteredTextures.length, virtualizer]);

    return (
        <div className="flex flex-col h-full">
            <div>
                <input
                    type="text"
                    placeholder="Search textures..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-4 p-2 rounded-md bg-neutral-900 border-2 border-zinc-800 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
                <ToggleGroup variant="outline" type="single" defaultValue="all" value={editFilter} onValueChange={(v) => v && setEditFilter(v as "all" | "Edited" | "Unedited")} className="mb-4 bg-neutral-900 border-2 border-zinc-800 text-zinc-300">
                    <ToggleGroupItem
                        value="all"
                        className="data-[state=on]:bg-primary data-[state=on]:text-white"
                    >All
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="Edited"
                        className="data-[state=on]:bg-primary data-[state=on]:text-white"
                    >Edited
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="Unedited"
                        className="data-[state=on]:bg-primary data-[state=on]:text-white"
                    >Unedited
                    </ToggleGroupItem>
                </ToggleGroup>
                <ToggleGroup variant="outline" type="multiple" value={selectedCategories} onValueChange={setSelectedCategories} className="mb-4 bg-neutral-900 border-2 border-zinc-800 text-zinc-300">
                        {Array.from(new Set(textures.map(t => t.category.split("/")[0]))).map(category => (
                            <ToggleGroupItem
                                key={category}
                                value={category}
                                className="data-[state=on]:bg-primary data-[state=on]:text-white"
                            >
                                {category}
                            </ToggleGroupItem>
                        ))}
                </ToggleGroup>
            </div>
            <div
                ref={scrollRef} 
                className="overflow-x-hidden flex-1 min-h-0 w-full
                    overflow-y-scroll
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-track]:rounded-full
                    scrollbar-thin
                    scrollbar-thumb-rounded-full
                    scrollbar-track-transparent
                    scrollbar-track-rounded-full
                    dark:[&::-webkit-scrollbar-thumb]:bg-linear-to-b
                    dark:[&::-webkit-scrollbar-thumb]:from-primary
                    dark:[&::-webkit-scrollbar-thumb]:to-primary/40
                    dark:scrollbar-thumb-gradient-to-b
                    dark:scrollbar-thumb-from-primary
                    dark:scrollbar-thumb-to-primary/40
                    [&::-webkit-scrollbar-thumb]:bg-linear-to-b
                    [&::-webkit-scrollbar-thumb]:from-neutral-600
                    [&::-webkit-scrollbar-thumb]:to-neutral-400/40
                    scrollbar-thumb-gradient-to-b
                    scrollbar-thumb-from-primary
                    scrollbar-thumb-to-primary/40
            "
            >
                <div
                    key={filteredTextures.length}
                    style={{
                        height: virtualizer.getTotalSize(),
                        position: "relative",
                    }}
                >
                    {virtualizer.getVirtualItems().map((row) => {
                        const start = row.index * cols;
                        const rowTextures = filteredTextures.slice(start, start + cols);

                        return (
                            <div
                                key={row.key}
                                style={{
                                    position: "absolute",
                                    width: "100%",
                                    height: ROW,
                                    transform: `translateY(${row.start}px)`,
                                    display: "flex",
                                    gap: GAP,
                                }}
                            >
                    {rowTextures.map(texture => {
                        const textureKey = texture.category + "/" + texture.filename;
                        const previewURL = editedTextures[textureKey] || texture.url;

                        return (
                            <div 
                                key={texture.filename} 
                                className="shrink-0 flex flex-col items-center gap-3 p-3 bg-neutral-900 border-2 border-zinc-800 relative hover:transform hover:scale-[1.03] transition-transform cursor-pointer"
                                style={{
                                    width: CARD,
                                    height: CARD
                                }}
                                onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setTooltip({
                                        name: texture.name,
                                        category: texture.category,
                                        x: rect.right,
                                        y: rect.top + rect.height / 2,
                                    });
                                    setHoveredTexture(texture.category + "/" + texture.filename);
                                }}
                                onMouseLeave={() => {
                                    setHoveredTexture(null);
                                    setTooltip(null);
                                }}
                            >
                                <img
                                    loading="lazy"
                                    src={previewURL} 
                                    alt={texture.name} 
                                    className="w-12 h-12 object-contain"
                                    style={{
                                        imageRendering: "pixelated",
                                    }}
                                />
                                {editedTextures[textureKey] && (
                                    <span className="absolute bottom-1.5 right-1.5 w-4 h-4 z-10 flex items-center justify-center">
                                        <Pen size={14} className="text-green-400" />
                                    </span>
                                )}

                                {hoveredTexture === texture.category + "/" + texture.filename ? (
                                    <div className="absolute inset-0 flex items-center justify-center border-2 border-primary">
                                        <div className="absolute w-7/8 h-2/7 bottom-2 bg-black/50 flex items-center justify-center rounded-xl">
                                            <Button className="h-full w-full" onClick={() => {
                                                navigate("/editor", {
                                                    state: {
                                                        path: texture.category + "/" + texture.filename,
                                                        width: texture.width,
                                                        height: texture.height,
                                                        aspect_ratio: texture.aspect_ratio,
                                                    }
                                                })
                                            }}>
                                                Edit
                                            </Button>
                                        </div>
                                        {editedTextures[textureKey] && (
                                            <Button variant="outline" className="absolute top-1.5 left-1.5 w-4 h-6 z-10 flex items-center justify-center" onClick={() => {
                                                const existingTexture = JSON.parse(localStorage.getItem("packmc_textures") || "{}");
                                                delete existingTexture[textureKey];
                                                localStorage.setItem("packmc_textures", JSON.stringify(existingTexture));
                                                setEditedTextures(existingTexture);
                                            }}>
                                                <Trash size={14} className="text-red-400" />
                                            </Button>
                                        )}
                                    </div>
                                    ) : null}
                            </div>
                        );
                    })}
                            </div>
                        );
                    })}
                </div>
            </div>
            {tooltip && createPortal(
                <div
                    className="fixed z-50 p-2 bg-neutral-950 border-2 border-zinc-800 text-sm pointer-events-none"
                    style={{
                        top: tooltip.y,
                        left: tooltip.x,
                        transform: "translate(8px, -50%)",
                    }}
                >
                    <div className="font-semibold">{tooltip.name}</div>
                    <div className="text-xs text-zinc-400">{tooltip.category}</div>
                </div>,
                document.body
            )}
        </div>
    );
}