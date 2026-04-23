import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card as Cardaevr } from "@/components/ui/aevr/card"
import {
    LayersIcon,
    DownloadIcon,
    PackmcLogoIcon
} from "@/components/icons";

export default function Landing() {
    const navigate = useNavigate();

    return (
    <section className="min-h-screen flex flex-col justify-start items-center text-primary dark:text-primary text-center px-6 pt-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 leading-tight">
                <PackmcLogoIcon className="inline-block w-auto h-48" fill="currentColor" /> PackMC
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl max-w-3xl opacity-90 mt-4">
                Create Minecraft texture & datapacks in your browser.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Button size="lg" className="w-42 h-16 text-2xl" onClick={() => navigate("/app")}>
                    Get started
                </Button>
            </div>
            <div className="gap-16 mt-36 max-w-400 w-full flex justify-items-center">
                <Cardaevr
                    className="bg-card"
                    icon={<LayersIcon size={32} />}
                    title="Instant Texture Creation"
                    subtitle="Design Minecraft textures fast"
                    variant="primary"
                    border="default"
                    hoverable={true}
                    size="xxl"
                    >
                    <p className="text-sm text-muted-foreground">
                        Create custom Minecraft textures right in your browser. No downloads, no setup. Start designing in seconds!
                    </p>
                </Cardaevr>
                <Cardaevr
                    className="bg-card"
                    icon={<DownloadIcon size={32} />}
                    title="One-Click Game Ready"
                    subtitle="Download and play instantly"
                    variant="primary"
                    border="default"
                    hoverable={true}
                    size="xxl"
                    >
                    <p className="text-sm text-muted-foreground">
                        Save your creations and load them into Minecraft. No hassle, no extra steps, just play!
                    </p>
                </Cardaevr>
            </div>
        </section>
    );
}