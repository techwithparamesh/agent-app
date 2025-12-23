import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Move,
  MousePointer,
  Undo,
  Redo,
  Lock,
  Unlock,
  Grid3X3,
  Save,
  Play,
  Eye,
} from "lucide-react";

interface WorkspaceCanvasProps {
  children: React.ReactNode;
  onDrop?: (data: any, position: { x: number; y: number }) => void;
  className?: string;
}

export function WorkspaceCanvas({
  children,
  onDrop,
  className,
}: WorkspaceCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<'select' | 'pan'>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Zoom controls
  const handleZoomIn = () => {
    setViewport(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.1, 2) }));
  };

  const handleZoomOut = () => {
    setViewport(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.1, 0.25) }));
  };

  const handleFitView = () => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  };

  // Pan controls
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && tool === 'pan')) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    }
  }, [tool, viewport.x, viewport.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && !isLocked) {
      setViewport(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  }, [isPanning, dragStart, isLocked]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setViewport(prev => ({
        ...prev,
        zoom: Math.min(Math.max(prev.zoom + delta, 0.25), 2),
      }));
    } else if (!isLocked) {
      setViewport(prev => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    }
  }, [isLocked]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && onDrop) {
        const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
        const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
        onDrop(data, { x, y });
      }
    } catch (err) {
      console.error('Drop error:', err);
    }
  }, [viewport, onDrop]);

  return (
    <TooltipProvider>
      <div className={cn("relative flex-1 overflow-hidden", className)}>
        {/* Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 bg-background/95 backdrop-blur-sm border rounded-xl shadow-lg">
          {/* Tool selection */}
          <div className="flex items-center gap-1 pr-3 border-r">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'select' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTool('select')}
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select (V)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={tool === 'pan' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setTool('pan')}
                >
                  <Move className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pan (H)</TooltipContent>
            </Tooltip>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 pr-3 border-r">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
            <Badge variant="outline" className="h-7 px-2 text-xs font-mono min-w-[50px] justify-center">
              {Math.round(viewport.zoom * 100)}%
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleZoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleFitView}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fit View</TooltipContent>
            </Tooltip>
          </div>

          {/* View options */}
          <div className="flex items-center gap-1 pr-3 border-r">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle Grid</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isLocked ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsLocked(!isLocked)}
                >
                  {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isLocked ? 'Unlock Canvas' : 'Lock Canvas'}</TooltipContent>
            </Tooltip>
          </div>

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Right toolbar */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Save Flow</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Test
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Test Flow</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Preview Flow</TooltipContent>
          </Tooltip>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className={cn(
            "w-full h-full",
            tool === 'pan' ? 'cursor-grab' : 'cursor-default',
            isPanning && 'cursor-grabbing',
            isDragOver && 'ring-2 ring-primary ring-inset'
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            backgroundImage: showGrid
              ? `radial-gradient(circle, hsl(var(--muted-foreground) / 0.15) 1px, transparent 1px)`
              : 'none',
            backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          }}
        >
          {/* Transformable content */}
          <div
            className="absolute pointer-events-none"
            style={{
              transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
              transformOrigin: '0 0',
            }}
          >
            <div className="pointer-events-auto">
              {children}
            </div>
          </div>

          {/* Empty state hint */}
          {!children && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={cn(
                "text-center p-8 rounded-2xl border-2 border-dashed transition-colors",
                isDragOver 
                  ? "border-primary bg-primary/5" 
                  : "border-muted-foreground/20"
              )}>
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Move className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Start Building</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Drag an app from the left panel to start building your automation flow
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Minimap placeholder */}
        <div className="absolute bottom-4 right-4 w-32 h-24 bg-background/80 backdrop-blur-sm border rounded-lg z-20 overflow-hidden">
          <div className="w-full h-full p-1">
            <div className="w-full h-full bg-muted/30 rounded relative">
              <div 
                className="absolute border border-primary bg-primary/10 rounded"
                style={{
                  width: `${Math.min(100, 100 / viewport.zoom)}%`,
                  height: `${Math.min(100, 100 / viewport.zoom)}%`,
                  left: `${Math.max(0, -viewport.x / 10)}%`,
                  top: `${Math.max(0, -viewport.y / 10)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Coordinates indicator */}
        <div className="absolute bottom-4 left-4 z-20 px-2 py-1 bg-background/80 backdrop-blur-sm border rounded text-xs font-mono text-muted-foreground">
          X: {Math.round(-viewport.x / viewport.zoom)} Y: {Math.round(-viewport.y / viewport.zoom)}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default WorkspaceCanvas;
