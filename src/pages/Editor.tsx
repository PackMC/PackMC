import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LayersIcon } from "@/components/icons";
import Navbar from "@/components/ui/navbar"

export default function Editor() {
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pixelSize = 16; // Size of each pixel in the canvas
    const gridSize = 16; // Number of pixels in each row and column

    const [pixels, setPixels] = useState<string[][]>(
        Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => "#000000") // black default
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
            });
        });
    }, [pixels]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const col = Math.floor(x / pixelSize);
        const row = Math.floor(y / pixelSize);

        // update pixel array
        setPixels((prevPixels) => {
            const newPixels = prevPixels.map((r) => r.slice());
            newPixels[row][col] = "#ffffff"; // change to white on click
            return newPixels;
        });
    }

    return (
        <div>
            <Navbar ButtonText="Export Pack" RootText="Editor" RootLink="/dashboard" Path="textures/block/diamond_ore.png" RootIcon={<LayersIcon size={18}/>} userEmail={userEmail} />
            <div className="min-h-screen flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    width={pixelSize * gridSize}
                    height={pixelSize * gridSize}
                    className="border"
                    onClick={handleCanvasClick}
                />
            </div>
        </div>
    )
}