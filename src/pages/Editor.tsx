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
    const [shapeStart, setShapeStart] = useState<{ col: number; row: number } | null>(null);
    const [isShapeDragging, setIsShapeDragging] = useState(false);
    const [previewEnd, setPreviewEnd] = useState<{ col: number; row: number } | null>(null);

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
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
            });
        });

        // preview shape
        if (shapeStart && previewEnd) {
            ctx.strokeStyle = "red";

            if (selectedTool === "square") {
                const minX = Math.min(shapeStart.col, previewEnd.col);
                const maxX = Math.max(shapeStart.col, previewEnd.col);
                const minY = Math.min(shapeStart.row, previewEnd.row);
                const maxY = Math.max(shapeStart.row, previewEnd.row);
                ctx.fillStyle = "#ffffff88"; // semi-transparent white for preview
                for (let x = minX; x <= maxX; x++) {
                    for (let y = minY; y <= maxY; y++) {
                        if (x === minX || x === maxX || y === minY || y === maxY) {
                            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        }
                    }
                }
            } else if (selectedTool === "circle") {
                const centerRow = shapeStart.row;
                const centerCol = shapeStart.col;

                const radius = Math.sqrt(
                    Math.pow((previewEnd.col - centerCol), 2) +
                    Math.pow((previewEnd.row - centerRow), 2)
                );

                for (let x = 0; x < gridSize; x++) {
                    for (let y = 0; y < gridSize; y++) {
                        const dist = Math.sqrt(Math.pow(x - centerCol, 2) + Math.pow(y - centerRow, 2));
                        if (Math.abs(dist - radius) < 0.5) { // simple circle approximation
                            ctx.fillStyle = "#ffffff88"; // semi-transparent white for preview
                            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        }
                    }
                }
            } else if (selectedTool === "line") {
                const x1 = shapeStart.col * pixelSize + pixelSize / 2;
                const y1 = shapeStart.row * pixelSize + pixelSize / 2;
                const x2 = previewEnd.col * pixelSize + pixelSize / 2;
                const y2 = previewEnd.row * pixelSize + pixelSize / 2;

                // Bresenham's line algorithm for preview
                const dx = Math.abs(x2 - x1);
                const dy = Math.abs(y2 - y1);
                const sx = x1 < x2 ? 1 : -1;
                const sy = y1 < y2 ? 1 : -1;
                let err = dx - dy;
                let x = x1;
                let y = y1;

                while (true) {
                    ctx.fillStyle = "#ffffff88"; // semi-transparent white for preview
                    ctx.fillRect(Math.floor(x / pixelSize) * pixelSize, Math.floor(y / pixelSize) * pixelSize, pixelSize, pixelSize);
                    if (x === x2 && y === y2) break;
                    const err2 = err * 2;
                    if (err2 > -dy) {
                        err -= dy;
                        x += sx * pixelSize;
                    }
                    if (err2 < dx) {
                        err += dx;
                        y += sy * pixelSize;
                    }
                }
            }
        }

        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        }
    }, [pixels, shapeStart, previewEnd]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const pos = getCanvasCoordinates(event);
        if (!pos) return;
        const { col: clampedCol, row: clampedRow } = pos;

        if (selectedTool === "square" || selectedTool === "circle" || selectedTool === "line") {
            const pos = { col: clampedCol, row: clampedRow };
            if (!isShapeDragging) {
                setShapeStart(pos);
                setPreviewEnd(pos);
                setIsShapeDragging(true);
                return;
            }

            if (isShapeDragging) {
                if (selectedTool === "square") {
                    drawSquare();
                } else if (selectedTool === "circle") {
                    drawCircle();
                } else if (selectedTool === "line") {
                    drawLine();
                }

                setShapeStart(null);
                setPreviewEnd(null);
                setIsShapeDragging(false);
                return;
            }
        }

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
        } else if (selectedTool === "fill") {
        }
    }

    const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const clampedCol = Math.max(0, Math.min(gridSize - 1, Math.floor(x / pixelSize)));
            const clampedRow = Math.max(0, Math.min(gridSize - 1, Math.floor(y / pixelSize)));
            return { col: clampedCol, row: clampedRow };
    }

    const drawSquare = () => {
        const minRow = Math.min(shapeStart?.row ?? 0, previewEnd?.row ?? 0);
        const maxRow = Math.max(shapeStart?.row ?? 0, previewEnd?.row ?? 0);
        const minCol = Math.min(shapeStart?.col ?? 0, previewEnd?.col ?? 0);
        const maxCol = Math.max(shapeStart?.col ?? 0, previewEnd?.col ?? 0);

        setPixels((prevPixels) => {
            const newPixels = prevPixels.map((r) => r.slice());

            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    if (r === minRow || r === maxRow || c === minCol || c === maxCol) {
                        newPixels[r][c] = "#ffffff"; // change to white on click
                    }
                }
            }
            return newPixels;
        });
    }

    const drawCircle = () => {
        const centerRow = shapeStart?.row ?? 0;
        const centerCol = shapeStart?.col ?? 0;
        const radius = Math.sqrt(Math.pow((previewEnd?.col ?? 0) - centerCol, 2) + Math.pow((previewEnd?.row ?? 0) - centerRow, 2));
        setPixels((prevPixels) => {
            const newPixels = prevPixels.map((r) => r.slice());
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    const dist = Math.sqrt(Math.pow(c - centerCol, 2) + Math.pow(r - centerRow, 2));
                    if (Math.abs(dist - radius) < 0.5) { // simple circle approximation
                        newPixels[r][c] = "#ffffff"; // change to white on click
                    }
                }                    
            }
            return newPixels;
        });
    }

    const drawLine = () => {
        if (!shapeStart || !previewEnd) return;
        const x1 = shapeStart.col;
        const y1 = shapeStart.row;
        const x2 = previewEnd.col;
        const y2 = previewEnd.row;

        setPixels((prevPixels) => {
            const newPixels = prevPixels.map((r) => r.slice());

            // Bresenham's line algorithm
            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            const sx = x1 < x2 ? 1 : -1;
            const sy = y1 < y2 ? 1 : -1;
            let err = dx - dy;
            let x = x1;
            let y = y1;

            while (true) {
                newPixels[y][x] = "#ffffff";
                if (x === x2 && y === y2) break;
                const err2 = err * 2;
                if (err2 > -dy) {
                    err -= dy;
                    x += sx;
                }
                if (err2 < dx) {
                    err += dx;
                    y += sy;
                }
            }
            return newPixels;
        });
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isShapeDragging) {
            const pos = getCanvasCoordinates(event);
            if (!pos) return;
            setPreviewEnd(pos);
            return;
        }

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
                        <ToggleGroupItem value="line">
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