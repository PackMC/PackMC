import Navbar from "@/components/ui/navbar";
import TextureCards from "@/components/ui/texturecards/TextureCards";

import textures from "@/data/minecraft_textures_index.json";

import JSZip from "jszip";

export default function PackView() {
    const packId = window.location.pathname.split("/").pop() || "";

    async function ExportPack() {
        const edited = JSON.parse(localStorage.getItem(`packmc_textures_${packId}`) || "{}");
        const entries = Object.entries(edited);

        if (entries.length === 0) {
            alert("No edited textures to export!");
            return;
        }

        const zip = new JSZip();

        zip.file("pack.mcmeta", JSON.stringify({
            pack: {
                min_format: 75,
                max_format: 84,
                description: "Created with PackMC"
            }
        }, null, 2));

        for (const [path, dataUrl] of entries) {
            const base64Data = (dataUrl as string).split(",")[1];
            zip.file(`assets/minecraft/textures/${path}`, base64Data, { base64: true });
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `packmc_pack_${new Date().toISOString()}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <section className="fixed top-0 left-0 w-full h-screen bg-background flex flex-col">
            <Navbar ButtonText="Export Pack" ButtonAction={ExportPack} RootText="PackMC" RootLink="/app"/>
            <div className="w-full flex-1 overflow-hidden p-4 pt-8">
                <TextureCards textures={textures} />
            </div>
        </section>
    );
}
