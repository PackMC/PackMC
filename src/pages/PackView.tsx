import Navbar from "@/components/ui/navbar";
import TextureCards from "@/components/ui/texturecards/TextureCards";

import textures from "@/data/minecraft_textures_index.json";


export default function PackView() {
    return (
        <section className="fixed top-0 left-0 w-full h-screen bg-background flex flex-col">
            <Navbar ButtonText="Export Pack" RootText="PackMC" RootLink="/app"/>
            <div className="w-full flex-1 overflow-hidden p-4 pt-8">
                <TextureCards textures={textures} />
            </div>
        </section>
    );
}
