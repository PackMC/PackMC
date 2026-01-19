//import { useNavigate } from "react-router-dom"
import { Button } from "@/components/animate-ui/components/buttons/button"
import { Button as Buttonshadcn } from "@/components/ui/button"
import { Card as Cardaevr } from "@/components/ui/aevr/card"
import { TimelineLayout } from "@/components/ui/timeline/timeline-layout"
import {
    LayersIcon,
    SlidersHorizontalIcon,
    DownloadIcon
} from "@/components/icons";
import { Check, GitBranch, GitPullRequest, Plus } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Landing() {
//  const navigate = useNavigate();

    return (
    <section className="min-h-screen flex flex-col justify-start items-center dark:text-white text-center px-6 pt-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 leading-tight">
                PackMC
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl max-w-3xl opacity-90 mt-4">
                Create Minecraft texture & datapacks in your browser.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
                <Button size="lg">Get started</Button>
                <Button size="lg" variant="outline">Login</Button>
            </div>
            <Button size="sm" className="mt-4 px-3 py-1 dark:text-white opacity-70 hover:opacity-100 transition-opacity" variant="link">Download PackMC Studio</Button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 mt-36 max-w-[100rem] w-full justify-items-center">
                <Cardaevr
                    className="bg-gradient-to-tr from-primary/10 to-primary/7"
                    icon={<LayersIcon size={32} />}
                    title="Instant Texture Creation"
                    subtitle="Design Minecraft textures fast"
                    variant="primary"
                    border="default"
                    hoverable={true}
                    clickable={true}
                    size="xxl"
                    >
                    <p className="text-sm text-muted-foreground">
                        Create custom Minecraft textures right in your browser — no downloads, no setup. Start designing in seconds!
                    </p>
                </Cardaevr>
                <Cardaevr
                    className="bg-gradient-to-tr from-primary/7 to-primary/5"
                    icon={<SlidersHorizontalIcon size={32} />}
                    title="Custom Datapacks Made Easy"
                    subtitle="Add your own rules and content"
                    variant="primary"
                    border="default"
                    hoverable={true}
                    clickable={true}
                    size="xxl"
                    >
                    <p className="text-sm text-muted-foreground">
                        Build and tweak datapacks for Minecraft with full control. Make custom mobs, items, and gameplay mechanics effortlessly.
                    </p>
                </Cardaevr>
                <Cardaevr
                    className="bg-gradient-to-tr from-primary/5 to-secondary md:col-span-2 md:justify-self-center lg:col-span-1"
                    icon={<DownloadIcon size={32} />}
                    title="One-Click Game Ready"
                    subtitle="Download and play instantly"
                    variant="primary"
                    border="default"
                    hoverable={true}
                    clickable={true}
                    size="xxl"
                    >
                    <p className="text-sm text-muted-foreground">
                        Save your creations and load them into Minecraft in just one click. No hassle, no extra steps — just play!
                    </p>
                </Cardaevr>
            </div>
            <TimelineLayout
                animate={true}
                className="min-h-[600px] w-full max-w-2xl mx-auto p-8 flex items-center justify-center"
                connectorColor="primary"
                iconColor="primary"
                size="lg"
                items={[
                    {
                        color: undefined,
                        date: (
                                <span className="text-3xl font-bold text-primary">Step 4</span>
                            ),
                        icon: <GitPullRequest />,
                        id: 1,
                        description: (

                            <Card className="p-0 max-w-sm w-full mt-8">
                                <CardHeader className="p-0 rounded-t-xl overflow-hidden">
                                    <img alt="Photo by mymind on Unsplash" title="Photo by mymind on Unsplash" className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale" src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&amp;w=1887&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></img>
                                </CardHeader>
                                <CardContent className="text-left">
                                    <CardTitle className="mb-2">Beautiful Landscape</CardTitle>
                                    <CardDescription>A stunning view that captures the essence of natural beauty.</CardDescription>
                                </CardContent>
                                <CardFooter className="pb-6">
                                    <CardAction className="w-full">
                                        <Buttonshadcn variant="default" className="text-secondary w-full">
                                            <Plus /> Button
                                        </Buttonshadcn>
                                    </CardAction>
                                </CardFooter>
                            </Card>
                            ),
                    },
                    {
                        color: undefined,
                        date: (

                            <Card className="p-0 max-w-sm w-full mt-8">
                                <CardHeader className="p-0 rounded-t-xl overflow-hidden">
                                    <img alt="Photo by mymind on Unsplash" title="Photo by mymind on Unsplash" className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale" src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&amp;w=1887&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></img>
                                </CardHeader>
                                <CardContent className="text-left">
                                    <CardTitle className="mb-2">Beautiful Landscape</CardTitle>
                                    <CardDescription>A stunning view that captures the essence of natural beauty.</CardDescription>
                                </CardContent>
                                <CardFooter className="pb-6">
                                    <CardAction className="w-full">
                                        <Buttonshadcn variant="default" className="text-secondary w-full">
                                            <Plus /> Button
                                        </Buttonshadcn>
                                    </CardAction>
                                </CardFooter>
                            </Card>
                            ),
                        icon: <GitPullRequest />,
                        id: 1,
                        description: (
                                <span className="text-3xl font-bold text-primary">Step 3</span>
                            ),
                    },
                    {
                        color: undefined,
                        date: (
                                <span className="text-3xl font-bold text-primary">Step 2</span>
                            ),
                        icon: <GitPullRequest />,
                        id: 1,
                        description: (

                            <Card className="p-0 max-w-sm w-full mt-8">
                                <CardHeader className="p-0 rounded-t-xl overflow-hidden">
                                    <img alt="Photo by mymind on Unsplash" title="Photo by mymind on Unsplash" className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale" src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&amp;w=1887&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></img>
                                </CardHeader>
                                <CardContent className="text-left">
                                    <CardTitle className="mb-2">Beautiful Landscape</CardTitle>
                                    <CardDescription>A stunning view that captures the essence of natural beauty.</CardDescription>
                                </CardContent>
                                <CardFooter className="pb-6">
                                    <CardAction className="w-full">
                                        <Buttonshadcn variant="default" className="text-secondary w-full">
                                            <Plus /> Button
                                        </Buttonshadcn>
                                    </CardAction>
                                </CardFooter>
                            </Card>
                            ),
                    },
                    {
                        color: undefined,
                        date: (

                            <Card className="p-0 max-w-sm w-full mt-8">
                                <CardHeader className="p-0 rounded-t-xl overflow-hidden">
                                    <img alt="Photo by mymind on Unsplash" title="Photo by mymind on Unsplash" className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale" src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&amp;w=1887&amp;auto=format&amp;fit=crop&amp;ixlib=rb-4.1.0&amp;ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"></img>
                                </CardHeader>
                                <CardContent className="text-left">
                                    <CardTitle className="mb-2">Beautiful Landscape</CardTitle>
                                    <CardDescription>A stunning view that captures the essence of natural beauty.</CardDescription>
                                </CardContent>
                                <CardFooter className="pb-6">
                                    <CardAction className="w-full">
                                        <Buttonshadcn variant="default" className="text-secondary w-full">
                                            <Plus /> Button
                                        </Buttonshadcn>
                                    </CardAction>
                                </CardFooter>
                            </Card>
                            ),
                        icon: <GitPullRequest />,
                        id: 1,
                        description: (
                                <span className="text-3xl font-bold text-primary">Step 1</span>
                            ),
                    }
                ]}
            />
        </section>
    );
}