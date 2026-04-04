import { TextureCards } from "@/types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../button";
import { Trash } from "lucide-react";

export default function Card({ texture, packId, onDelete }: { texture: TextureCards; packId: string; onDelete: () => void }) {
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const [src, setSrc] = useState(() => {
        const edited = JSON.parse(localStorage.getItem(`packmc_textures_${packId}`) || "{}");
        return edited[`${texture.category}/${texture.filename}`] || texture.url;
    });

    const isEdited = src !== texture.url;

    const navigate = useNavigate();

    const openEditor = () => {
        navigate("/editor", {
            state: {
                path: `${texture.category}/${texture.filename}`,
                width: texture.width,
                height: texture.height,
                packId,
                originalUrl: texture.url,
            },
        })
    };

    return (
        <div
            className={`h-32 w-32 relative bg-card rounded-md flex flex-col items-center transition-all duration-100 ${isHovered ? "border-border border-3" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                loading="lazy"
                src={src}
                alt={texture.name}
                className={`w-full p-2 object-contain transition-all duration-100 ${isHovered ? "h-20" : "h-full"}`}
                style={{ imageRendering: "pixelated" }}
            />

            {isHovered && (
                <>
                    <Button variant="default" size="sm" className="w-[calc(100%-1rem)]" onClick={openEditor}>
                        EDIT
                    </Button>
                    <div className="fixed z-50 bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-button-primary text-button-text-primary text-sm h-8 rounded px-2 flex items-center">
                        {texture.name}
                    </div>
                </>
            )}

            {isHovered && isEdited && (
                <Button variant="destructive" size="icon" className="absolute top-1 right-1" onClick={() => {
                    const existing = JSON.parse(localStorage.getItem(`packmc_textures_${packId}`) || "{}");
                    delete existing[`${texture.category}/${texture.filename}`];
                    localStorage.setItem(`packmc_textures_${packId}`, JSON.stringify(existing));
                    setSrc(texture.url);

                    onDelete();
                }}>
                    <Trash size={16} />
                 </Button>
             )}
        </div>
    );
}