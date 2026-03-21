import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LayersIcon } from "@/components/icons";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Navbar from "@/components/ui/navbar"
import { Circle, Eraser, Eye, EyeOff, Minus, PaintBucket, Pen, Plus, Redo, Slash, Square, Undo } from "lucide-react";
import { ColorPicker, ColorPickerAlphaSlider, ColorPickerArea, ColorPickerContent, ColorPickerEyeDropper, ColorPickerFormatSelect, ColorPickerHueSlider, ColorPickerInput, ColorPickerTrigger } from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";


const makeEmptyGrid = (rows: number, cols: number) =>
    Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => "transparent")
    );

export default function Editor() {
    const navigate = useNavigate();

    const location = useLocation();
    const path = location.state?.path || "error/error.png";
    const gridCols = location.state?.width || 16;
    const gridRows = location.state?.height || 16;

    const savedTexture = useMemo(() =>
        JSON.parse(localStorage.getItem("packmc_textures") || "{}")[path] ?? null
    , [path]);

    const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
    const [isDrawing, setIsDrawing] = useState(false);
    const [selectedTool, setSelectedTool] = useState<string>("pen");
    const [selectedColor, setSelectedColor] = useState<string>("#f4f4f4");
    const [customColor, setCustomColor] = useState<string>("#f08000");
    const [colorPalette, setColorPalette] = useState<string[]>(["#1a1c2c", "#b13e53", "#ef7d57", "#ffcd75", "#38b764", "#3b5dc9", "#73eff7", "#f4f4f4"]);
    const [shapeStart, setShapeStart] = useState<{ col: number; row: number } | null>(null);
    const [isShapeDragging, setIsShapeDragging] = useState(false);
    const [previewEnd, setPreviewEnd] = useState<{ col: number; row: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [showBackground, setShowBackground] = useState(true);

    const MAX_WIDTH = 712;
    const MAX_HEIGHT = 712;
    const pixelSize = Math.floor(Math.min(MAX_WIDTH / gridCols, MAX_HEIGHT / gridRows));
    
    const historyIndex = useRef<number>(0);

    const addColorToPalette = () => {
        setColorPalette((prev) => {
            if (prev.includes(customColor)) return prev;
            return [...prev, customColor];
        });
        setSelectedColor(customColor);
    }
    
    const initialGrid = useMemo(() => makeEmptyGrid(gridRows, gridCols), []);
    const history = useRef<string[][][]>([initialGrid]);
    const [pixels, setPixels] = useState<string[][]>(initialGrid);

    const pixelsRef = useRef<string[][]>(initialGrid);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const didDrawRef = useRef(false);

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
            if (didDrawRef.current) {
                saveHistory(pixelsRef.current);
                didDrawRef.current = false;
            }
            if (isShapeDragging) {
                if (selectedTool === "square") {
                    drawSquare(shapeStart, previewEnd, pixelsRef.current);
                } else if (selectedTool === "circle") {
                    drawCircle(shapeStart, previewEnd, pixelsRef.current);
                } else if (selectedTool === "line") {
                    drawLine(shapeStart, previewEnd, pixelsRef.current);
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
    }, [selectedTool, isShapeDragging, shapeStart, previewEnd]);

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
                if (color !== "transparent") {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
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

                for (let x = 0; x < gridCols; x++) {
                    for (let y = 0; y < gridRows; y++) {
                        const dist = Math.sqrt(Math.pow(x - centerCol, 2) + Math.pow(y - centerRow, 2));
                        if (Math.abs(dist - radius) < 0.5) { // simple circle approximation
                            ctx.fillStyle = selectedColor + "88"; // semi-transparent for preview
                            ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                        }
                    }
                }
            } else if (selectedTool === "line") {
                const x1 = shapeStart.col;
                const y1 = shapeStart.row;
                const x2 = previewEnd.col;
                const y2 = previewEnd.row;

                // Bresenham's line algorithm
                const dx = Math.abs(x2 - x1);
                const dy = Math.abs(y2 - y1);
                const sx = x1 < x2 ? 1 : -1;
                const sy = y1 < y2 ? 1 : -1;
                let err = dx - dy;
                let x = x1;
                let y = y1;

                ctx.fillStyle = selectedColor + "88"; // semi-transparent for preview
                while (true) {
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
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
            }
        }
    }, [pixels, shapeStart, previewEnd, selectedTool, selectedColor]);

    const undo = useCallback(() => {
        if (historyIndex.current > 0) {
            historyIndex.current -= 1;
            setPixels(history.current[historyIndex.current]);
            pixelsRef.current = history.current[historyIndex.current];
        }
    }, []);

    const redo = useCallback(() => {
        if (historyIndex.current < history.current.length - 1) {
            historyIndex.current += 1;
            setPixels(history.current[historyIndex.current]);
            pixelsRef.current = history.current[historyIndex.current];

        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "z") {
                event.preventDefault();
                undo();
            } else if (event.ctrlKey && event.key === "y") {
                event.preventDefault();
                redo();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [undo, redo]);

    const saveHistory = useCallback((newPixels: string[][]) => {
        if (historyIndex.current < history.current.length - 1) {
            history.current = history.current.slice(0, historyIndex.current + 1);
        }
        history.current.push(newPixels);
        historyIndex.current += 1;
    }, []);

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasCoordinates(event);
        if (!pos) return;
        const { col: clampedCol, row: clampedRow } = pos;
        
        // update pixel array
        if (selectedTool === "pen") {
            const newPixels = pixelsRef.current.map((r) => r.slice());
            newPixels[clampedRow][clampedCol] = selectedColor; // change to selected color on click
            setPixels(newPixels);
            pixelsRef.current = newPixels;
            didDrawRef.current = true;
        } else if (selectedTool === "eraser") {
            const newPixels = pixelsRef.current.map((r) => r.slice());
            newPixels[clampedRow][clampedCol] = "transparent"; // change to transparent on click
            setPixels(newPixels);
            pixelsRef.current = newPixels;
            didDrawRef.current = true;
        } else if (selectedTool === "fill") {
            const targetColor = pixelsRef.current[clampedRow][clampedCol];
            const replacementColor = selectedColor;
            floodFill(clampedCol, clampedRow, targetColor, replacementColor);
            return;
        }
    }

    useEffect(() => {
        if (!savedTexture) return;

        const img = new Image();
        img.onload = () => {
            const offscreenCanvas = document.createElement("canvas");
            offscreenCanvas.width = gridCols;
            offscreenCanvas.height = gridRows;
            const ctx = offscreenCanvas.getContext("2d");
            if (!ctx) return;

            ctx.drawImage(img, 0, 0, gridCols, gridRows);
            const imageData = ctx.getImageData(0, 0, gridCols, gridRows).data;
            const newPixels = makeEmptyGrid(gridRows, gridCols);
            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const a = imageData[i + 3];
                const pixelIndex = i / 4;
                const row = Math.floor(pixelIndex / gridCols);
                const col = pixelIndex % gridCols;
                newPixels[row][col] = a === 0 ? "transparent" : `rgba(${r},${g},${b},${a / 255})`;
            }
            setPixels(newPixels);
            pixelsRef.current = newPixels;
            history.current = [newPixels];
            historyIndex.current = 0;
        };
        img.src = savedTexture;

    }, [savedTexture, gridCols, gridRows]);

    const getCanvasCoordinates = (event: React.MouseEvent<HTMLCanvasElement>): { col: number; row: number } | null => {
            const canvas = canvasRef.current;
            if (!canvas) return null;
            const rect = canvas.getBoundingClientRect();
            const x = (event.clientX - rect.left) / zoom;
            const y = (event.clientY - rect.top) / zoom;
            const clampedCol = Math.max(0, Math.min(gridCols - 1, Math.floor(x / pixelSize)));
            const clampedRow = Math.max(0, Math.min(gridRows - 1, Math.floor(y / pixelSize)));
            return { col: clampedCol, row: clampedRow };
    }

    const drawSquare = (start: { col: number; row: number } | null, end: { col: number; row: number } | null, currentPixels: string[][]) => {
        if (!start || !end) return;
        const minRow = Math.min(start.row, end.row);
        const maxRow = Math.max(start.row, end.row);
        const minCol = Math.min(start.col, end.col);
        const maxCol = Math.max(start.col, end.col);
        const newPixels = currentPixels.map((r) => r.slice());
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                if (r === minRow || r === maxRow || c === minCol || c === maxCol) {
                    newPixels[r][c] = selectedColor; // change to selected color on click
                }
            }
        }
        setPixels(newPixels);
        pixelsRef.current = newPixels;
        saveHistory(newPixels);
    }

    const drawCircle = (start: { col: number; row: number } | null, end: { col: number; row: number } | null, currentPixels: string[][]) => {
        if (!start || !end) return;
        const centerRow = start.row;
        const centerCol = start.col;
        const radius = Math.sqrt(Math.pow((end.col) - centerCol, 2) + Math.pow((end.row) - centerRow, 2));
        const newPixels = currentPixels.map((r) => r.slice());
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                const dist = Math.sqrt(Math.pow(c - centerCol, 2) + Math.pow(r - centerRow, 2));
                if (Math.abs(dist - radius) < 0.5) { // simple circle approximation
                    newPixels[r][c] = selectedColor; // change to selected color on click
                }
            }                    
        }
        setPixels(newPixels);
        pixelsRef.current = newPixels;
        saveHistory(newPixels);
    }

    const drawLine = (start: { col: number; row: number } | null, end: { col: number; row: number } | null, currentPixels: string[][]) => {
        if (!start || !end) return;
        const x1 = start.col;
        const y1 = start.row;
        const x2 = end.col;
        const y2 = end.row;
        const newPixels = currentPixels.map((r) => r.slice());

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
        setPixels(newPixels);
        pixelsRef.current = newPixels;
        saveHistory(newPixels);
    }

    const floodFill = (startCol: number, startRow: number, targetColor: string, replacementColor: string) => {
        if (targetColor === replacementColor) return;
        const newPixels = pixelsRef.current.map((r) => r.slice());
        const stack = [{ col: startCol, row: startRow }];
        while (stack.length > 0) {
            const { col, row } = stack.pop()!;
            if (col < 0 || col >= gridCols || row < 0 || row >= gridRows) continue;
            if (newPixels[row][col] !== targetColor) continue;
            newPixels[row][col] = replacementColor;
            stack.push({ col: col + 1, row });
            stack.push({ col: col - 1, row });
            stack.push({ col, row: row + 1 });
            stack.push({ col, row: row - 1 });
        }
        setPixels(newPixels);
        pixelsRef.current = newPixels;
        saveHistory(newPixels);
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

    const saveTexture = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // offscreen canvas to resize to original dimensions, no gridlines
        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = gridCols;
        offscreenCanvas.height = gridRows;
        const ctx = offscreenCanvas.getContext("2d");
        if (!ctx) return;

        pixelsRef.current.forEach((row, y) => {
            row.forEach((color, x) => {
                if (color !== "transparent") {
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, 1, 1); // 1 pixel per grid cell
                }
            });
        });

        const dataUrl = offscreenCanvas.toDataURL("image/png");
        const existing = JSON.parse(localStorage.getItem("packmc_textures") || "{}");
        existing[path] = dataUrl;
        localStorage.setItem("packmc_textures", JSON.stringify(existing));

        navigate("/dashboard");
    }

    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (event.ctrlKey) {
                event.preventDefault();
                const zoomAmount = -event.deltaY * 0.001;
                setZoom((prevZoom) => Math.min(1.2, Math.max(0.5, prevZoom + zoomAmount)));
            }
        };
        window.addEventListener("wheel", handleWheel, { passive: false });  
        return () => {
            window.removeEventListener("wheel", handleWheel);
        }
    }, []);

    return (
        <div className="flex flex-col h-screen">
            <Navbar ButtonText="Save" ButtonAction={saveTexture} ButtonActionType="function" RootText="Editor" RootLink="/dashboard" Path={path} RootIcon={<LayersIcon size={18}/>} userEmail={userEmail} />
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
                        <Button onClick={undo} size="sm" variant="ghost"><Undo /></Button>
                        <Button onClick={redo} size="sm" variant="ghost"><Redo /> </Button>
                </div>
                <div className="absolute right-4 bottom-4 flex bg-secondary/50 rounded-md p-1 gap-2">
                        <Button onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))} size="sm" variant="ghost"><Plus /></Button>
                        <span className="text-xs self-center text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                        <Button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))} size="sm" variant="ghost"><Minus /> </Button>
                </div>
                <div className="absolute left-28 bottom-4 flex bg-secondary/50 rounded-md p-1 gap-2">
                    <Button onClick={() => setShowBackground(!showBackground)} size="sm" variant="ghost">
                        {showBackground ? <Eye /> : <EyeOff />}
                    </Button>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div
                        className="relative"
                        style={{
                            width: pixelSize * gridCols,
                            height: pixelSize * gridRows,
                            transform: `scale(${zoom})`,
                            transformOrigin: `center center`
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            width={pixelSize * gridCols}
                            height={pixelSize * gridRows}
                            className="border cursor-crosshair"
                            onClick={handleCanvasClick}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            style={{ background: "transparent" }}
                        />
                        {showBackground && (
                            <img
                                src={`https://assets.mcasset.cloud/latest/assets/minecraft/textures/${path}`}
                                alt="texture reference"
                                className="absolute w-full h-full object-cover opacity-30 pointer-events-none"
                                style={{ 
                                    imageRendering: `pixelated`,
                                    top: 0,
                                    left: 0,
                                    zIndex: -1,
                                    width: '100%',
                                    height: '100%',
                                }}
                                draggable={false}
                            />
                        )}
                    </div>
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col bg-secondary/50 rounded-md p-2 gap-2 h-160">
                    <div className="pr-2 pl-3 overflow-y-auto flex flex-col items-center flex-1 min-h-0 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent scrollbar-track-rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-linear-to-b dark:[&::-webkit-scrollbar-thumb]:from-primary dark:[&::-webkit-scrollbar-thumb]:to-primary/40 dark:scrollbar-thumb-gradient-to-b dark:scrollbar-thumb-from-primary dark:scrollbar-thumb-to-primary/40 [&::-webkit-scrollbar-thumb]:bg-linear-to-b [&::-webkit-scrollbar-thumb]:from-neutral-600 [&::-webkit-scrollbar-thumb]:to-neutral-400/40 scrollbar-thumb-gradient-to-b scrollbar-thumb-from-primary scrollbar-thumb-to-primary/40">
                        <ToggleGroup type="single" orientation="vertical" spacing={3} value={selectedColor} onValueChange={(v) => v && setSelectedColor(v)} className="flex flex-col">
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
                            <ColorPickerContent className="mr-23 top-1/2 transform -translate-y-1/2">
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