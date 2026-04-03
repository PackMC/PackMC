import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import Navbar from "@/components/ui/navbar"
import { Circle, Eraser, Eye, EyeOff, PaintBucket, Pen, Plus, Redo, Slash, Square, Undo } from "lucide-react";
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";
import { Button } from "@/components/ui/button";


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
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

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
    
    const initialGrid = useMemo(() => makeEmptyGrid(gridRows, gridCols), [gridRows, gridCols]);
    const history = useRef<string[][][]>([initialGrid]);
    const [pixels, setPixels] = useState<string[][]>(initialGrid);

    const pixelsRef = useRef<string[][]>(initialGrid);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const didDrawRef = useRef<boolean>(false);
    const selectedColorRef = useRef(selectedColor);

    useEffect(() => {
        selectedColorRef.current = selectedColor;
        const handleMouseUp = () => {
            setIsDrawing(false);

            const isShapeTool = selectedTool === "square" || selectedTool === "circle" || selectedTool === "line";

            if (!isShapeTool && didDrawRef.current) {
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
                setIsShapeDragging(false);
                setShapeStart(null);
                setPreviewEnd(null);
            }
        };
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mouseup", handleMouseUp);
        }
    }, [selectedTool, selectedColor, isShapeDragging, shapeStart, previewEnd]);

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
                ctx.fillStyle = selectedColorRef.current + "88"; // semi-transparent for preview
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
                            ctx.fillStyle = selectedColorRef.current + "88"; // semi-transparent for preview
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

                ctx.fillStyle = selectedColorRef.current + "88"; // semi-transparent for preview
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
    }, [pixels, shapeStart, previewEnd, selectedTool, selectedColor, showBackground]);

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
            newPixels[clampedRow][clampedCol] = selectedColorRef.current; // change to selected color on click
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
            const replacementColor = selectedColorRef.current;
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
                    newPixels[r][c] = selectedColorRef.current; // change to selected color on click
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
                    newPixels[r][c] = selectedColorRef.current; // change to selected color on click
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
            newPixels[y][x] = selectedColorRef.current;
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
        } else {
            handleCanvasClick(event);
        }
    }


    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasCoordinates(event);
        if (pos) {
            setMouseX(pos.col);
            setMouseY(pos.row);
        }

        if (isShapeDragging) {
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
        <div>
            <Navbar
                RootText="PackMC"
                RootLink="/app"
                ButtonText="Save File"
                ButtonAction={saveTexture}
            />
            <div className="flex w-full h-[calc(100vh-4rem)]">
                <div className="flex flex-col w-full">
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="left-5 absolute">
                            <ToggleGroup className="bg-card/80 border border-sidebar-border/10 p-1 gap-3 flex flex-col" variant="packmc2" type="single" value={selectedTool} onValueChange={(value) => value && setSelectedTool(value)}>
                                <ToggleGroupItem value="pen" aria-label="Pen Tool">
                                    <Pen size={20} />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="eraser" aria-label="Eraser Tool">
                                    <Eraser size={20} />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="fill" aria-label="Fill Tool">
                                    <PaintBucket size={20} />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="square" aria-label="Square Tool">
                                    <Square size={20} />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="circle" aria-label="Circle Tool">
                                    <Circle size={20} />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="line" aria-label="Line Tool">
                                    <Slash size={20} />
                                </ToggleGroupItem>
                            </ToggleGroup>
                            <div className="bg-card/80 border border-sidebar-border/10 p-1 mt-3 flex flex-col">
                            <Button className="bg-transparent py-5 text-text-muted hover:bg-card hover:text-text-secondary data-[state=on]:rounded-4xl" aria-label="Undo" onClick={undo}>
                                <Undo size={20} />
                            </Button>
                            <Button className="bg-transparent py-5 text-text-muted hover:bg-card hover:text-text-secondary data-[state=on]:rounded-4xl" aria-label="Redo" onClick={redo}>
                                <Redo size={20} />
                            </Button>
                            <Button className="bg-transparent py-5 text-text-muted hover:bg-card hover:text-text-secondary data-[state=on]:rounded-4xl" aria-label="Toggle Background" onClick={() => setShowBackground((prev) => !prev)}>
                                {showBackground ? <Eye size={20} /> : <EyeOff size={20} />}
                            </Button>
                            </div>
                        </div>
                        <div className="bg-card-secondary border-card-foreground border-3 box-content mx-auto drop-shadow-[0_0_20px_rgba(204,151,255,0.2)]" style={{ width: gridCols * pixelSize, height: gridRows * pixelSize, transform: `scale(${zoom})`, transformOrigin: 'center' }}>
                            <canvas
                                ref={canvasRef}
                                width={gridCols * pixelSize}
                                height={gridRows * pixelSize}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                className="cursor-crosshair"
                                style={{ display: "block" }}
                            />
                        </div>
                    </div>
                    <div className="bg-card-secondary w-full mt-auto h-10 items-center flex px-4 gap-8">
                        <span>POS {mouseX}, {mouseY}</span>
                        <span>Color: {selectedColor}</span>
                        {/* right */}
                        <span>{gridCols}x{gridRows} PX</span>
                        <span>Zoom {Math.round(zoom * 100)}%</span>
                    </div>
                </div>
                <div className="bg-card-secondary w-1/5 ml-auto p-2 flex flex-col gap-8">
                    <div className="flex flex-col">
                        <span>
                            TEXTURE NAME
                        </span>
                        <span>{path.split("/").slice(-1)[0]}</span>
                    </div>
                    <div>
                        <span>SWATCHES</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                        {colorPalette.map((color) => (
                                <button
                                    key={color}
                                    className="w-17 h-17 rounded-sm border-2 border-white/10"
                                    style={{ backgroundColor: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                            <ColorPicker value={customColor} onValueChange={setCustomColor}>
                                <ColorPickerTrigger asChild>
                                    <button className="w-17 h-17 rounded-sm border-2 border-white/10 flex items-center justify-center bg-card-foreground">
                                        <Plus size={20} color="#fff" />
                                    </button>
                                </ColorPickerTrigger>
                                <ColorPickerContent>
                                    <ColorPickerArea />
                                    <ColorPickerEyeDropper />
                                    <ColorPickerHueSlider />
                                    <ColorPickerAlphaSlider />
                                    <ColorPickerFormatSelect />
                                    <ColorPickerInput />
                                    <Button onClick={addColorToPalette} className="w-full mt-2">Add to Palette</Button>
                                </ColorPickerContent>
                            </ColorPicker>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}