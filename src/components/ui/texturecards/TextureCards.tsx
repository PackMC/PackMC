import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface TextureCards {
    display_name: string;
    category: string;
    filename: string;
    url: string;
}

interface TextureCardsProps {
    textures: TextureCards[];
}

const CARD_SIZE = 112;
const GAP = 12;

export default function TextureCards({ textures }: TextureCardsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scrollRef.current) return;
        const ro = new ResizeObserver(([entry]) => {
            const width = entry.contentRect.width;
            const cols = Math.max(1, Math.floor((width + GAP) / (CARD_SIZE + GAP)));
            setCols(cols);
        });
        ro.observe(scrollRef.current);
        return () => ro.disconnect();
    }, []);

    const [cols, setCols] = useState(() => {
        return Math.max(1, Math.floor((window.innerWidth + GAP) / (CARD_SIZE + GAP)));
    });

    const rows = Math.ceil(textures.length / cols);

    const virtualizer = useVirtualizer({
        count: rows,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => CARD_SIZE + GAP,
        overscan: 2,
    });


    return (
        <div 
            ref={scrollRef} 
            className="overflow-auto h-full w-full
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
            <div style={{
                height: virtualizer.getTotalSize(),
                width: "100%",
                position: "relative",
            }}>
                {virtualizer.getVirtualItems().map((virtualRow) => (
                    <div
                        key={virtualRow.key}
                        style={{
                            position: "absolute",
                            top: virtualRow.start,
                            left: 0,
                            width: "100%",
                            display: "flex",
                            gap: GAP,
                        }}
                    >
                        {textures.slice(virtualRow.index * cols, virtualRow.index * cols + cols).map((texture) => (
                            <div key={texture.filename} className="shrink-0 flex flex-col items-center gap-2 p-3 rounded-xl bg-zinc-800 border border-zinc-700" style={{ width: CARD_SIZE, height: CARD_SIZE }}>
                                <img src={texture.url} alt={texture.display_name} className="w-12 h-12 object-contain" style={{ imageRendering: "pixelated" }} />
                                <span className="text-xs text-zinc-300 text-center leading-tight line-clamp-2">{texture.display_name}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}