import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Type,
  Palette,
  Shapes,
  Layout,
  Download,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Square,
  Circle,
  Triangle,
  Star,
  X,
  Save,
  Image,
  FileImage,
  FileCode,
  ChevronDown,
} from "lucide-react";

interface PosterEditorProps {
  poster: {
    id: string;
    headline?: string | null;
    subheadline?: string | null;
    offerText?: string | null;
    ctaText?: string | null;
    title?: string | null;
    platform?: string | null;
    size?: string | null;
    colorScheme?: any;
    svgContent?: string | null;
  };
  onSave: (updates: any) => void;
  onClose: () => void;
}

interface EditorState {
  headline: string;
  subheadline: string;
  offerText: string;
  ctaText: string;
  brandName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fontSize: {
    headline: number;
    subheadline: number;
    offer: number;
    cta: number;
  };
  layout: string;
  shapes: { type: string; x: number; y: number; size: number; color: string; opacity: number }[];
}

const PLATFORM_SIZES: Record<string, Record<string, { width: number; height: number }>> = {
  instagram: {
    post: { width: 1080, height: 1080 },
    story: { width: 1080, height: 1920 },
    landscape: { width: 1080, height: 566 },
  },
  facebook: {
    post: { width: 1200, height: 630 },
    cover: { width: 820, height: 312 },
    story: { width: 1080, height: 1920 },
  },
  linkedin: {
    post: { width: 1200, height: 627 },
    cover: { width: 1584, height: 396 },
  },
  twitter: {
    post: { width: 1200, height: 675 },
    header: { width: 1500, height: 500 },
  },
};

const LAYOUTS = [
  { id: "centered", name: "Centered", icon: "⬜" },
  { id: "top-heavy", name: "Top Heavy", icon: "🔼" },
  { id: "bottom-heavy", name: "Bottom Heavy", icon: "🔽" },
  { id: "left-aligned", name: "Left Aligned", icon: "◀️" },
  { id: "diagonal", name: "Diagonal", icon: "↗️" },
];

const SHAPE_TYPES = [
  { id: "circle", name: "Circle", icon: Circle },
  { id: "square", name: "Square", icon: Square },
  { id: "triangle", name: "Triangle", icon: Triangle },
  { id: "star", name: "Star", icon: Star },
];

export function PosterEditor({ poster, onSave, onClose }: PosterEditorProps) {
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const defaultColors = poster.colorScheme || {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#f59e0b",
    background: "#0f172a",
    text: "#ffffff",
  };

  const [editorState, setEditorState] = useState<EditorState>({
    headline: poster.headline || "SPECIAL OFFER",
    subheadline: poster.subheadline || "Limited Time Only",
    offerText: poster.offerText || "50% OFF",
    ctaText: poster.ctaText || "SHOP NOW",
    brandName: poster.title || "Your Brand",
    colors: defaultColors,
    fontSize: {
      headline: 72,
      subheadline: 36,
      offer: 42,
      cta: 32,
    },
    layout: "centered",
    shapes: [],
  });

  const dimensions = PLATFORM_SIZES[poster.platform || "instagram"]?.[poster.size || "post"] || { width: 1080, height: 1080 };
  const isVertical = dimensions.height > dimensions.width;

  // Save to history when state changes
  useEffect(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ ...editorState });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, []);

  const updateState = (updates: Partial<EditorState>) => {
    const newState = { ...editorState, ...updates };
    setEditorState(newState);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 50) newHistory.shift(); // Limit history
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setEditorState(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setEditorState(history[historyIndex + 1]);
    }
  };

  const addShape = (type: string) => {
    const newShape = {
      type,
      x: 50,
      y: 50,
      size: 100,
      color: editorState.colors.primary,
      opacity: 0.2,
    };
    updateState({ shapes: [...editorState.shapes, newShape] });
  };

  const removeShape = (index: number) => {
    const newShapes = [...editorState.shapes];
    newShapes.splice(index, 1);
    updateState({ shapes: newShapes });
  };

  const updateShape = (index: number, updates: Partial<typeof editorState.shapes[0]>) => {
    const newShapes = [...editorState.shapes];
    newShapes[index] = { ...newShapes[index], ...updates };
    updateState({ shapes: newShapes });
  };

  // Generate SVG content based on current editor state
  const generatedSvg = useMemo(() => {
    const { colors, headline, subheadline, offerText, ctaText, brandName, fontSize, shapes, layout } = editorState;
    
    // Layout positioning based on selection
    const getPositions = () => {
      switch (layout) {
        case "top-heavy":
          return {
            offer: isVertical ? 0.12 : 0.15,
            headline: isVertical ? 0.28 : 0.35,
            subheadline: isVertical ? 0.36 : 0.45,
            cta: isVertical ? 0.55 : 0.65,
            brand: isVertical ? 0.92 : 0.92,
          };
        case "bottom-heavy":
          return {
            offer: isVertical ? 0.45 : 0.35,
            headline: isVertical ? 0.58 : 0.50,
            subheadline: isVertical ? 0.66 : 0.60,
            cta: isVertical ? 0.80 : 0.78,
            brand: isVertical ? 0.92 : 0.92,
          };
        case "left-aligned":
          return {
            offer: isVertical ? 0.15 : 0.20,
            headline: isVertical ? 0.35 : 0.45,
            subheadline: isVertical ? 0.42 : 0.55,
            cta: isVertical ? 0.78 : 0.82,
            brand: isVertical ? 0.92 : 0.92,
            textAnchor: "start",
            xPos: 0.08,
          };
        default: // centered
          return {
            offer: isVertical ? 0.15 : 0.20,
            headline: isVertical ? 0.35 : 0.45,
            subheadline: isVertical ? 0.42 : 0.55,
            cta: isVertical ? 0.78 : 0.82,
            brand: isVertical ? 0.92 : 0.94,
            textAnchor: "middle",
            xPos: 0.5,
          };
      }
    };

    const pos = getPositions();
    const textAnchor = pos.textAnchor || "middle";
    const xPos = pos.xPos || 0.5;

    // Render shapes
    const renderShapes = () => {
      return shapes.map((shape, i) => {
        const cx = (shape.x / 100) * dimensions.width;
        const cy = (shape.y / 100) * dimensions.height;
        
        switch (shape.type) {
          case "circle":
            return `<circle cx="${cx}" cy="${cy}" r="${shape.size}" fill="${shape.color}" opacity="${shape.opacity}"/>`;
          case "square":
            return `<rect x="${cx - shape.size/2}" y="${cy - shape.size/2}" width="${shape.size}" height="${shape.size}" fill="${shape.color}" opacity="${shape.opacity}"/>`;
          case "triangle":
            const h = shape.size * 0.866;
            return `<polygon points="${cx},${cy - h/2} ${cx - shape.size/2},${cy + h/2} ${cx + shape.size/2},${cy + h/2}" fill="${shape.color}" opacity="${shape.opacity}"/>`;
          case "star":
            const points = [];
            for (let j = 0; j < 10; j++) {
              const r = j % 2 === 0 ? shape.size : shape.size / 2;
              const angle = (j * Math.PI) / 5 - Math.PI / 2;
              points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
            }
            return `<polygon points="${points.join(' ')}" fill="${shape.color}" opacity="${shape.opacity}"/>`;
          default:
            return "";
        }
      }).join("\n");
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dimensions.width} ${dimensions.height}" width="${dimensions.width}" height="${dimensions.height}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.background};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.secondary}30;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>
  
  <!-- Decorative shapes -->
  ${renderShapes()}
  
  <!-- Offer badge -->
  <g transform="translate(${dimensions.width * xPos}, ${dimensions.height * pos.offer})">
    <rect x="-${Math.min(dimensions.width * 0.3, 200)}" y="-40" width="${Math.min(dimensions.width * 0.6, 400)}" height="80" rx="40" fill="url(#accentGradient)" filter="url(#glow)"/>
    <text x="0" y="12" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize.offer}" font-weight="800" fill="${colors.text}">${offerText}</text>
  </g>
  
  <!-- Main headline -->
  <text x="${dimensions.width * xPos}" y="${dimensions.height * pos.headline}" text-anchor="${textAnchor}" font-family="Arial, sans-serif" font-size="${fontSize.headline}" font-weight="800" fill="${colors.text}" filter="url(#shadow)">
    ${headline}
  </text>
  
  <!-- Subheadline -->
  <text x="${dimensions.width * xPos}" y="${dimensions.height * pos.subheadline}" text-anchor="${textAnchor}" font-family="Arial, sans-serif" font-size="${fontSize.subheadline}" fill="${colors.text}" opacity="0.9">
    ${subheadline}
  </text>
  
  <!-- CTA Button -->
  <g transform="translate(${dimensions.width * xPos}, ${dimensions.height * pos.cta})">
    <rect x="-${Math.min(dimensions.width * 0.25, 180)}" y="-35" width="${Math.min(dimensions.width * 0.5, 360)}" height="70" rx="35" fill="${colors.accent}" filter="url(#shadow)"/>
    <text x="0" y="10" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize.cta}" font-weight="700" fill="${colors.background}">${ctaText}</text>
  </g>
  
  <!-- Brand name -->
  <text x="${dimensions.width * xPos}" y="${dimensions.height * pos.brand}" text-anchor="${textAnchor}" font-family="Arial, sans-serif" font-size="${isVertical ? 28 : 24}" font-weight="600" fill="${colors.text}" opacity="0.7">
    ${brandName}
  </text>
</svg>`;
  }, [editorState, dimensions, isVertical]);

  const handleSave = () => {
    onSave({
      headline: editorState.headline,
      subheadline: editorState.subheadline,
      offerText: editorState.offerText,
      ctaText: editorState.ctaText,
      title: editorState.brandName,
      colorScheme: editorState.colors,
      svgContent: generatedSvg,
    });
  };

  const downloadPoster = (format: "svg" | "png" | "jpg") => {
    if (format === "svg") {
      const blob = new Blob([generatedSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${editorState.brandName}-poster.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const svgBlob = new Blob([generatedSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Use higher resolution for better quality
        const scale = 2;
        canvas.width = dimensions.width * scale;
        canvas.height = dimensions.height * scale;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0);
          const mimeType = format === "png" ? "image/png" : "image/jpeg";
          const quality = format === "jpg" ? 0.92 : undefined;
          canvas.toBlob((blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = imageUrl;
              a.download = `${editorState.brandName}-poster.${format}`;
              a.click();
              URL.revokeObjectURL(imageUrl);
            }
          }, mimeType, quality);
        }
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b bg-card px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <span className="font-semibold">Poster Editor</span>
          <span className="text-muted-foreground text-sm">
            {poster.platform} • {poster.size} ({dimensions.width}×{dimensions.height})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
            <Undo className="h-4 w-4 mr-1" /> Undo
          </Button>
          <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
            <Redo className="h-4 w-4 mr-1" /> Redo
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(200, zoom + 25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setZoom(100)}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" /> Download
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => downloadPoster("png")}>
                <FileImage className="h-4 w-4 mr-2" />
                Download as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadPoster("jpg")}>
                <Image className="h-4 w-4 mr-2" />
                Download as JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => downloadPoster("svg")}>
                <FileCode className="h-4 w-4 mr-2" />
                Download as SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-80 border-r bg-card overflow-hidden flex flex-col">
          <Tabs defaultValue="text" className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 m-2">
              <TabsTrigger value="text" className="text-xs">
                <Type className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">
                <Palette className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="shapes" className="text-xs">
                <Shapes className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">
                <Layout className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              {/* Text Tab */}
              <TabsContent value="text" className="m-0 p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Offer Badge</Label>
                  <Input
                    value={editorState.offerText}
                    onChange={(e) => updateState({ offerText: e.target.value })}
                    placeholder="50% OFF"
                  />
                  <Slider
                    value={[editorState.fontSize.offer]}
                    onValueChange={([v]) => updateState({ fontSize: { ...editorState.fontSize, offer: v } })}
                    min={24}
                    max={72}
                    step={2}
                  />
                  <span className="text-xs text-muted-foreground">Size: {editorState.fontSize.offer}px</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Headline</Label>
                  <Input
                    value={editorState.headline}
                    onChange={(e) => updateState({ headline: e.target.value })}
                    placeholder="SPECIAL OFFER"
                  />
                  <Slider
                    value={[editorState.fontSize.headline]}
                    onValueChange={([v]) => updateState({ fontSize: { ...editorState.fontSize, headline: v } })}
                    min={36}
                    max={120}
                    step={4}
                  />
                  <span className="text-xs text-muted-foreground">Size: {editorState.fontSize.headline}px</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Subheadline</Label>
                  <Input
                    value={editorState.subheadline}
                    onChange={(e) => updateState({ subheadline: e.target.value })}
                    placeholder="Limited Time Only"
                  />
                  <Slider
                    value={[editorState.fontSize.subheadline]}
                    onValueChange={([v]) => updateState({ fontSize: { ...editorState.fontSize, subheadline: v } })}
                    min={18}
                    max={60}
                    step={2}
                  />
                  <span className="text-xs text-muted-foreground">Size: {editorState.fontSize.subheadline}px</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Call to Action</Label>
                  <Input
                    value={editorState.ctaText}
                    onChange={(e) => updateState({ ctaText: e.target.value })}
                    placeholder="SHOP NOW"
                  />
                  <Slider
                    value={[editorState.fontSize.cta]}
                    onValueChange={([v]) => updateState({ fontSize: { ...editorState.fontSize, cta: v } })}
                    min={20}
                    max={48}
                    step={2}
                  />
                  <span className="text-xs text-muted-foreground">Size: {editorState.fontSize.cta}px</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Brand Name</Label>
                  <Input
                    value={editorState.brandName}
                    onChange={(e) => updateState({ brandName: e.target.value })}
                    placeholder="Your Brand"
                  />
                </div>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="m-0 p-4 space-y-4">
                <ColorPicker
                  label="Background"
                  value={editorState.colors.background}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, background: color } })}
                />
                <ColorPicker
                  label="Primary Color"
                  value={editorState.colors.primary}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, primary: color } })}
                />
                <ColorPicker
                  label="Secondary Color"
                  value={editorState.colors.secondary}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, secondary: color } })}
                />
                <ColorPicker
                  label="Accent Color (CTA)"
                  value={editorState.colors.accent}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, accent: color } })}
                />
                <ColorPicker
                  label="Text Color"
                  value={editorState.colors.text}
                  onChange={(color) => updateState({ colors: { ...editorState.colors, text: color } })}
                />

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Color Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#f59e0b", background: "#0f172a", text: "#ffffff" }
                      })}
                    >
                      Purple Night
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#ef4444", secondary: "#dc2626", accent: "#fbbf24", background: "#1f2937", text: "#ffffff" }
                      })}
                    >
                      Red Hot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#10b981", secondary: "#059669", accent: "#06b6d4", background: "#0f172a", text: "#ffffff" }
                      })}
                    >
                      Ocean Green
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#f97316", secondary: "#ea580c", accent: "#fbbf24", background: "#18181b", text: "#ffffff" }
                      })}
                    >
                      Sunset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#ec4899", secondary: "#db2777", accent: "#8b5cf6", background: "#0f0f0f", text: "#ffffff" }
                      })}
                    >
                      Pink Glow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateState({
                        colors: { primary: "#3b82f6", secondary: "#2563eb", accent: "#22c55e", background: "#ffffff", text: "#0f172a" }
                      })}
                    >
                      Light Mode
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Shapes Tab */}
              <TabsContent value="shapes" className="m-0 p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Add Decorative Shape</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {SHAPE_TYPES.map((shape) => {
                      const Icon = shape.icon;
                      return (
                        <Button
                          key={shape.id}
                          variant="outline"
                          size="sm"
                          onClick={() => addShape(shape.id)}
                          className="h-12 flex flex-col gap-1"
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs">{shape.name}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {editorState.shapes.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-xs font-medium">Active Shapes</Label>
                    {editorState.shapes.map((shape, index) => (
                      <Card key={index} className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{shape.type}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeShape(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">X Position</Label>
                            <Slider
                              value={[shape.x]}
                              onValueChange={([v]) => updateShape(index, { x: v })}
                              min={0}
                              max={100}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Y Position</Label>
                            <Slider
                              value={[shape.y]}
                              onValueChange={([v]) => updateShape(index, { y: v })}
                              min={0}
                              max={100}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Size</Label>
                          <Slider
                            value={[shape.size]}
                            onValueChange={([v]) => updateShape(index, { size: v })}
                            min={20}
                            max={300}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Opacity</Label>
                          <Slider
                            value={[shape.opacity * 100]}
                            onValueChange={([v]) => updateShape(index, { opacity: v / 100 })}
                            min={5}
                            max={100}
                          />
                        </div>
                        <ColorPicker
                          label="Color"
                          value={shape.color}
                          onChange={(color) => updateShape(index, { color })}
                        />
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shapes className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No shapes added yet</p>
                    <p className="text-xs">Click a shape above to add</p>
                  </div>
                )}
              </TabsContent>

              {/* Layout Tab */}
              <TabsContent value="layout" className="m-0 p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Layout Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {LAYOUTS.map((layout) => (
                      <Button
                        key={layout.id}
                        variant={editorState.layout === layout.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateState({ layout: layout.id })}
                        className="h-12 flex flex-col gap-1"
                      >
                        <span>{layout.icon}</span>
                        <span className="text-xs">{layout.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-xs font-medium">Quick Actions</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      updateState({
                        headline: "SPECIAL OFFER",
                        subheadline: "Limited Time Only",
                        offerText: "50% OFF",
                        ctaText: "SHOP NOW",
                      });
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" /> Reset Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => updateState({ shapes: [] })}
                  >
                    <X className="h-4 w-4 mr-2" /> Clear All Shapes
                  </Button>
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-muted/30 overflow-auto flex items-center justify-center p-8">
          <div
            className="bg-white shadow-2xl rounded-lg overflow-hidden"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center center",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: generatedSvg }}
              style={{
                width: dimensions.width > dimensions.height ? "600px" : "auto",
                height: dimensions.height > dimensions.width ? "600px" : "auto",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
