import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LayersIcon } from "@/components/icons";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Navbar from "@/components/ui/navbar"
import { Circle, Eraser, PaintBucket, Pen, Slash, Square } from "lucide-react";

export default function Editor() {
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string>("pen");

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pixelSize = 44; // Size of each pixel in the canvas
    const gridSize = 16; // Number of pixels in each row and column

    const [pixels, setPixels] = useState<string[][]>(
        Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => "transparent") // transparent default
        )
    );

    useEffect(() => {
        // Get the logged-in user
        supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user?.email) {
                setUserEmail(data.session.user.email);
            } else {
                navigate("/auth");
            }
        });

        const handleMouseUp = () => setIsDrawing(false);
        window.addEventListener("mouseup", handleMouseUp);

        // Initialize the canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw each pixel
        pixels.forEach((row, y) => {
            row.forEach((color, x) => {
                ctx.fillStyle = color;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                ctx.strokeStyle = "#ccc";
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            });
        });

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        }
    }, [pixels]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.floor(x / pixelSize);
        const row = Math.floor(y / pixelSize);

        const clampedCol = Math.max(0, Math.min(gridSize - 1, col));
        const clampedRow = Math.max(0, Math.min(gridSize - 1, row));

        // update pixel array
        if (selectedTool === "pen") {
            setPixels((prevPixels) => {
                const newPixels = prevPixels.map((r) => r.slice());
                newPixels[clampedRow][clampedCol] = "#ffffff"; // change to white on click
                return newPixels;
            });
        } else if (selectedTool === "eraser") {
            setPixels((prevPixels) => {
                const newPixels = prevPixels.map((r) => r.slice());
                newPixels[clampedRow][clampedCol] = "transparent"; // change to transparent on click
                return newPixels;
            });
        }
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        handleCanvasClick(event);
    }

    const exportCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "exported-pixel-art.png";
        link.click();
    };

    return (
        <div className="flex flex-col h-screen">
            <Navbar ButtonText="Save" ButtonAction={exportCanvas} ButtonActionType="function" RootText="Editor" RootLink="/dashboard" Path="textures/block/diamond_ore.png" RootIcon={<LayersIcon size={18}/>} userEmail={userEmail} />
            <div className="flex flex-1 overflow-hidden">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col bg-secondary/50 rounded-md space-y-2 p-1">
                    <ToggleGroup type="single" orientation="vertical" spacing={1} value={selectedTool} onValueChange={setSelectedTool} className="flex flex-col">
                        <ToggleGroupItem value="pen">
                            <Pen size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="eraser">
                            <Eraser size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="fill">
                            <PaintBucket size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="square">
                            <Square size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="circle">
                            <Circle size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="slash">
                            <Slash size={18} />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        width={pixelSize * gridSize}
                        height={pixelSize * gridSize}
                        className="border"
                        onClick={handleCanvasClick}
                        onMouseDown={() => setIsDrawing(true)}
                        onMouseMove={handleMouseMove}
                    />
                </div>
            </div>
        </div>
    )
}