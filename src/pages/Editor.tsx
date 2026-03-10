import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LayersIcon } from "@/components/icons";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Navbar from "@/components/ui/navbar"
import { Circle, Eraser, PaintBucket, Pen, Plus, Redo, Slash, Square, Undo } from "lucide-react";
import { ColorPicker, ColorPickerAlphaSlider, ColorPickerArea, ColorPickerContent, ColorPickerEyeDropper, ColorPickerFormatSelect, ColorPickerHueSlider, ColorPickerInput, ColorPickerTrigger } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Editor() {
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string>("pen");
    const [selectedColor, setSelectedColor] = useState<string>("#ffffff");
    const [customColor, setCustomColor] = useState<string>("#f08000");
    const [colorPalette, setColorPalette] = useState<string[]>(["#1a1c2c", "#b13e53", "#ef7d57", "#ffcd75", "#38b764", "#3b5dc9", "#73eff7", "#f4f4f4"]);
    const [shapeStart, setShapeStart] = useState<{ col: number; row: number } | null>(null);
    const [isShapeDragging, setIsShapeDragging] = useState(false);
    const [previewEnd, setPreviewEnd] = useState<{ col: number; row: number } | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const pixelSize = 44; // Size of each pixel in the canvas
    const gridSize = 16; // Number of pixels in each row and column

    const addColorToPalette = () => {
        setColorPalette((prev) => {
            if (prev.includes(customColor)) return prev;
            return [...prev, customColor];
        });
        setSelectedColor(customColor);
    }

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
    }, []);

    useEffect(() => {
        const handleMouseUp = () => {
            setIsDrawing(false);
            if (isShapeDragging) {
                if (selectedTool === "square") {
                    drawSquare(shapeStart, previewEnd);
                } else if (selectedTool === "circle") {
                    drawCircle(shapeStart, previewEnd);
                } else if (selectedTool === "line") {
                    drawLine(shapeStart, previewEnd);
                }
                setShapeStart(null);
                setPreviewEnd(null);
                setIsShapeDragging(false);
            }
        };
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        }
    }, [isShapeDragging, selectedTool, shapeStart, previewEnd]);

    useEffect(() => {

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
                ctx.strokeStyle = "#333"; // grid lines
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
            });
        });

        // preview shape
        if (shapeStart && previewEnd) {

            if (selectedTool === "square") {
                const minX = Math.min(shapeStart.col, previewEnd.col);
                const maxX = Math.max(shapeStart.col, previewEnd.col);
                const minY = Math.min(shapeStart.row, previewEnd.row);
                const maxY = Math.max(shapeStart.row, previewEnd.row);
                ctx.fillStyle = selectedColor + "88"; // semi-transparent for preview
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
                            ctx.fillStyle = selectedColor + "88"; // semi-transparent for preview
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
                    ctx.fillStyle = selectedColor + "88"; // semi-transparent for preview
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
    }, [pixels, shapeStart, previewEnd, selectedTool, selectedColor]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const pos = getCanvasCoordinates(event);
        if (!pos) return;
        const { col: clampedCol, row: clampedRow } = pos;

        if (selectedTool === "fill") {
            const targetColor = pixels[clampedRow][clampedCol];
            const replacementColor = selectedColor;
            floodFill(clampedCol, clampedRow, targetColor, replacementColor);
            return;
        }

        // update pixel array
        if (selectedTool === "pen") {
            setPixels((prevPixels) => {
                const newPixels = prevPixels.map((r) => r.slice());
                newPixels[clampedRow][clampedCol] = selectedColor; // change to selected color on click
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

    const drawSquare = (start: { col: number; row: number } | null, end: { col: number; row: number } | null) => {
        if (!start || !end) return;
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);

        setPixels((prevPixels) => {
            const newPixels = prevPixels.map((r) => r.slice());

            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    if (r === minRow || r === maxRow || c === minCol || c === maxCol) {
                        newPixels[r][c] = selectedColor; // change to selected color on click
                    }
                }
            }
            return newPixels;
        });
    }

    const drawCircle = (start: { col: number; row: number } | null, end: { col: number; row: number } | null) => {
        if (!start || !end) return;
        const centerRow = start.row;
        const centerCol = start.col;
        const radius = Math.sqrt(Math.pow((end.col) - centerCol, 2) + Math.pow((end.row) - centerRow, 2));
        setPixels((prevPixels) => {
            const newPixels = prevPixels.map((r) => r.slice());
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    const dist = Math.sqrt(Math.pow(c - centerCol, 2) + Math.pow(r - centerRow, 2));
                    if (Math.abs(dist - radius) < 0.5) { // simple circle approximation
                        newPixels[r][c] = selectedColor; // change to selected color on click
                    }
                }                    
            }
            return newPixels;
        });
    }

    const drawLine = (start: { col: number; row: number } | null, end: { col: number; row: number } | null) => {
        if (!start || !end) return;
        const x1 = start.col;
        const y1 = start.row;
        const x2 = end.col;
        const y2 = end.row;

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
                newPixels[y][x] = selectedColor;
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

    const floodFill = (startCol: number, startRow: number, targetColor: string, replacementColor: string) => {
        if (targetColor === replacementColor) return;
        const newPixels = pixels.map((r) => r.slice());
        const stack = [{ col: startCol, row: startRow }];
        while (stack.length > 0) {
            const { col, row } = stack.pop()!;
            if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) continue;
            if (newPixels[row][col] !== targetColor) continue;
            newPixels[row][col] = replacementColor;
            stack.push({ col: col + 1, row });
            stack.push({ col: col - 1, row });
            stack.push({ col, row: row + 1 });
            stack.push({ col, row: row - 1 });
        }
        setPixels(newPixels);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        if (selectedTool === "square" || selectedTool === "circle" || selectedTool === "line") {
            const pos = getCanvasCoordinates(event);
            if (!pos) return;
            setShapeStart(pos);
            setPreviewEnd(pos);
            setIsShapeDragging(true);
        }
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
                        <ToggleGroupItem value="pen" className=" cursor-pointer">
                            <Pen size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="eraser" className=" cursor-pointer">
                            <Eraser size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="fill" className=" cursor-pointer">
                            <PaintBucket size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="square" className=" cursor-pointer">
                            <Square size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="circle" className=" cursor-pointer">
                            <Circle size={18} />
                        </ToggleGroupItem>
                        <ToggleGroupItem value="line" className=" cursor-pointer">
                            <Slash size={18} />
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className="absolute left-4 bottom-4 flex bg-secondary/50 rounded-md p-1 gap-2">
                        <Button size="sm" variant="ghost"><Undo /></Button>
                        <Button size="sm" variant="ghost"><Redo /> </Button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <canvas
                        ref={canvasRef}
                        width={pixelSize * gridSize}
                        height={pixelSize * gridSize}
                        className="border cursor-crosshair"
                        onClick={handleCanvasClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                    />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col bg-secondary/50 rounded-md p-2 gap-2 h-160">
                    <div className="pr-2 pl-3 overflow-y-auto flex flex-col items-center flex-1 min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-track-rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-linear-to-b dark:[&::-webkit-scrollbar-thumb]:from-primary dark:[&::-webkit-scrollbar-thumb]:to-primary/40 dark:scrollbar-thumb-gradient-to-b dark:scrollbar-thumb-from-primary dark:scrollbar-thumb-to-primary/40 [&::-webkit-scrollbar-thumb]:bg-linear-to-b [&::-webkit-scrollbar-thumb]:from-neutral-600 [&::-webkit-scrollbar-thumb]:to-neutral-400/40 scrollbar-thumb-gradient-to-b scrollbar-thumb-from-primary scrollbar-thumb-to-primary/40">
                        <ToggleGroup type="single" orientation="vertical" spacing={3} value={selectedColor} onValueChange={setSelectedColor} className="flex flex-col">
                            {colorPalette.map((color) => (
                                <div key={color} className="relative flex items-center">
                                    {selectedColor === color && <span className="absolute -left-5 text-foreground/70 text-xl leading-none select-none pointer-events-none">▶</span>}
                                    <ToggleGroupItem key={color} value={color} className="w-6 h-6 rounded cursor-pointer" style={{ backgroundColor: color }} />
                                </div>
                            ))}
                        </ToggleGroup>
                    </div>
                    <Separator className="shrink-0" />
                    <div className="shrink-0 flex justify-center">
                        <ColorPicker defaultFormat="hex" defaultValue="#f08000" onValueChange={(color) => setCustomColor(color)}>
                            <div className="flex justify-center">
                                <ColorPickerTrigger asChild>
                                    <Plus size={18} className="cursor-pointer w-6 h-6 rounded border" />
                                </ColorPickerTrigger>
                            </div>
                            <ColorPickerContent className="mr-16 top-1/2 transform -translate-y-1/2">
                                <ColorPickerArea />
                                <div className="flex items-center gap-2">
                                    <ColorPickerEyeDropper />
                                    <div className="flex flex-1 flex-col gap-2">
                                        <ColorPickerHueSlider />
                                        <ColorPickerAlphaSlider />
                                        </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ColorPickerFormatSelect />
                                    <ColorPickerInput />
                                </div>
                                <Button onClick={addColorToPalette} size="sm">Add to palette</Button>
                            </ColorPickerContent>
                        </ColorPicker>
                    </div>
                </div>
            </div>
        </div>
    )
}