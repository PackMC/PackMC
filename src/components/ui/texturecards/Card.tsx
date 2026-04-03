import { TextureCards } from "@/types";
import { useState } from "react";
import { Button } from "../button";

export default function Card({ texture }: { texture: TextureCards }) {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    return (
        <div
            className={`h-32 w-32 bg-card rounded-md flex flex-col items-center transition-all duration-100 ${isHovered ? "border-border border-3" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                loading="lazy"
                src={texture.url}
                alt={texture.name}
                className={`w-full p-2 object-contain transition-all duration-100 ${isHovered ? "h-20" : "h-full"}`}
                style={{ imageRendering: "pixelated" }}
            />

            {isHovered && (
                <>
                    <Button variant="default" size="sm" className="w-[calc(100%-1rem)]">
                        EDIT
                    </Button>
                    <div className="fixed z-50 bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-button-primary text-button-text-primary text-sm h-8 rounded px-2 flex items-center">
                        {texture.name}
                    </div>
                </>
            )}
        </div>
    );
}