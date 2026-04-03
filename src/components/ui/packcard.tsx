import { Button } from "@/components/ui/button";
import { More } from "iconsax-react";
import { useNavigate } from "react-router";
import { useState } from "react";

export default function PackCard(PackCardProps: { name: string, edited: string, assets: number, id: string, onDelete: () => void }) {

    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    function deletePack(id: string) {
        const stored = JSON.parse(localStorage.getItem("packmc_packs") || "[]");
        const updatedPacks = stored.filter((pack: any) => pack.id !== id);
        localStorage.setItem("packmc_packs", JSON.stringify(updatedPacks));
        setIsMenuOpen(false);
        PackCardProps.onDelete();
    }

    return (
        <div className="w-md h-76 bg-card rounded-lg shadow-md">
            <div
                className="w-full h-42 rounded-t-lg overflow-hidden"
                style={{
                    background: `
                            repeating-conic-gradient(#909090 0 25%, #808080 0 50%) 
                                50% / 56px 56px
                    `,
                }}
            />
            <div className="px-4">
                <div>
                    <div className="pt-3 pb-1 flex justify-between items-start">
                        <div>
                            <p className="font-bold text-lg text-text-primary-secondary">
                                {PackCardProps.name}
                            </p>
                            <p className="text-text-muted-secondary text-sm mt-0.5">
                                {PackCardProps.edited}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-text-muted-secondary">
                                EDITED
                            </p>
                            <p className="text-text-secondary text-sm mt-0.5">
                                {PackCardProps.assets.toLocaleString()} Assets
                            </p>
                        </div>
                    </div>
                </div>
                <div className="py-4 flex gap-2">
                    <Button onClick={() => {
                        const stored = JSON.parse(localStorage.getItem("packmc_packs") || "[]");
                        const updatedPacks = stored.map((pack: any) => pack.id === PackCardProps.id ? { ...pack, edited: new Date().toISOString() } : pack);
                        localStorage.setItem("packmc_packs", JSON.stringify(updatedPacks));
                            navigate(`/pack/${PackCardProps.id}`)
                        }}
                        size="sm" className="flex-1 w-full bg-outlined-button-background text-outlined-button-text h-10 border border-outlined-button-stroke/30 hover:bg-outlined-button-background-hover">
                        OPEN
                    </Button>
                    <div className="relative">
                        <Button size="sm" className="w-10 h-10 shrink-0 bg-outlined-button-background text-outlined-button-text border border-outlined-button-stroke/30 hover:bg-outlined-button-background-hover p-0" onClick={() => setIsMenuOpen(v => !v)}>
                            <More size={18} />
                        </Button>
                        {isMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                                <div className="absolute top-12 right-0 w-40 z-20 bg-card border border-zinc-800 rounded-md shadow-lg overflow-hidden">
                                    <button
                                        onClick={() => {setIsMenuOpen(false); deletePack(PackCardProps.id)}}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}