/**
 * Sticky Note Component
 * 
 * n8n-style sticky notes for documenting workflows on the canvas.
 * Features: resizable, multiple colors, rich text editing.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GripVertical,
  MoreVertical,
  Trash2,
  Copy,
  Palette,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  List,
  Link,
  Type,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type StickyNoteColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';

export interface StickyNoteData {
  id: string;
  content: string;
  color: StickyNoteColor;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StickyNoteProps {
  note: StickyNoteData;
  isSelected?: boolean;
  isDragging?: boolean;
  zoom?: number;
  
  // Events
  onSelect?: () => void;
  onContentChange?: (content: string) => void;
  onColorChange?: (color: StickyNoteColor) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: { width: number; height: number }) => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onDragEnd?: () => void;
  
  className?: string;
}

// ============================================
// CONSTANTS
// ============================================

const MIN_WIDTH = 200;
const MIN_HEIGHT = 100;
const MAX_WIDTH = 600;
const MAX_HEIGHT = 500;

const colorConfig: Record<StickyNoteColor, {
  bg: string;
  border: string;
  header: string;
  text: string;
  placeholder: string;
}> = {
  yellow: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-300 dark:border-yellow-700',
    header: 'bg-yellow-200/50 dark:bg-yellow-800/50',
    text: 'text-yellow-900 dark:text-yellow-100',
    placeholder: 'placeholder-yellow-500/50',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    header: 'bg-green-200/50 dark:bg-green-800/50',
    text: 'text-green-900 dark:text-green-100',
    placeholder: 'placeholder-green-500/50',
  },
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    header: 'bg-blue-200/50 dark:bg-blue-800/50',
    text: 'text-blue-900 dark:text-blue-100',
    placeholder: 'placeholder-blue-500/50',
  },
  pink: {
    bg: 'bg-pink-100 dark:bg-pink-900/30',
    border: 'border-pink-300 dark:border-pink-700',
    header: 'bg-pink-200/50 dark:bg-pink-800/50',
    text: 'text-pink-900 dark:text-pink-100',
    placeholder: 'placeholder-pink-500/50',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-300 dark:border-purple-700',
    header: 'bg-purple-200/50 dark:bg-purple-800/50',
    text: 'text-purple-900 dark:text-purple-100',
    placeholder: 'placeholder-purple-500/50',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'border-orange-300 dark:border-orange-700',
    header: 'bg-orange-200/50 dark:bg-orange-800/50',
    text: 'text-orange-900 dark:text-orange-100',
    placeholder: 'placeholder-orange-500/50',
  },
};

const colorOptions: { value: StickyNoteColor; label: string; preview: string }[] = [
  { value: 'yellow', label: 'Yellow', preview: 'bg-yellow-400' },
  { value: 'green', label: 'Green', preview: 'bg-green-400' },
  { value: 'blue', label: 'Blue', preview: 'bg-blue-400' },
  { value: 'pink', label: 'Pink', preview: 'bg-pink-400' },
  { value: 'purple', label: 'Purple', preview: 'bg-purple-400' },
  { value: 'orange', label: 'Orange', preview: 'bg-orange-400' },
];

// ============================================
// COMPONENT
// ============================================

export function StickyNote({
  note,
  isSelected = false,
  isDragging = false,
  zoom = 1,
  onSelect,
  onContentChange,
  onColorChange,
  onPositionChange,
  onSizeChange,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragEnd,
  className,
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(note.content);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const colors = colorConfig[note.color];

  // Sync local content with prop
  useEffect(() => {
    if (!isEditing) {
      setLocalContent(note.content);
    }
  }, [note.content, isEditing]);

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  // Handle content save
  const handleContentSave = useCallback(() => {
    setIsEditing(false);
    if (localContent !== note.content) {
      onContentChange?.(localContent);
    }
  }, [localContent, note.content, onContentChange]);

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: note.size.width,
      height: note.size.height,
    });
  }, [note.size]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - resizeStart.x) / zoom;
      const deltaY = (e.clientY - resizeStart.y) / zoom;
      
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeStart.width + deltaX));
      const newHeight = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, resizeStart.height + deltaY));
      
      onSizeChange?.({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStart, zoom, onSizeChange]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalContent(note.content);
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleContentSave();
    }
  }, [note.content, handleContentSave]);

  return (
    <TooltipProvider>
      <div
        ref={noteRef}
        className={cn(
          'absolute rounded-lg border-2 shadow-md transition-shadow',
          colors.bg,
          colors.border,
          isSelected && 'ring-2 ring-primary ring-offset-2',
          isDragging && 'opacity-80 shadow-xl cursor-grabbing',
          !isDragging && 'cursor-default',
          className
        )}
        style={{
          left: note.position.x,
          top: note.position.y,
          width: note.size.width,
          height: note.size.height,
          zIndex: note.zIndex ?? 10,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
      >
        {/* Header / Drag Handle */}
        <div
          className={cn(
            'flex items-center justify-between px-2 py-1 rounded-t-md cursor-grab active:cursor-grabbing',
            colors.header
          )}
          onMouseDown={(e) => {
            if (e.button === 0) {
              onDragStart?.(e);
            }
          }}
        >
          <div className="flex items-center gap-1">
            <GripVertical className="w-4 h-4 text-muted-foreground/50" />
            <span className={cn('text-xs font-medium', colors.text)}>
              Note
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Color Picker */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-70 hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Palette className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {colorOptions.map((color) => (
                  <DropdownMenuItem
                    key={color.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      onColorChange?.(color.value);
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className={cn('w-4 h-4 rounded', color.preview)} />
                    <span>{color.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-70 hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate?.();
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-3 overflow-hidden" style={{ height: note.size.height - 32 }}>
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={localContent}
              onChange={(e) => setLocalContent(e.target.value)}
              onBlur={handleContentSave}
              onKeyDown={handleKeyDown}
              className={cn(
                'w-full h-full bg-transparent border-none outline-none resize-none text-sm',
                colors.text,
                colors.placeholder
              )}
              placeholder="Write a note..."
              style={{ minHeight: '100%' }}
            />
          ) : (
            <div
              className={cn(
                'w-full h-full text-sm whitespace-pre-wrap overflow-auto',
                colors.text,
                !note.content && 'text-muted-foreground/50 italic'
              )}
            >
              {note.content || 'Double-click to edit...'}
            </div>
          )}
        </div>

        {/* Resize Handle */}
        <div
          className={cn(
            'absolute bottom-0 right-0 w-4 h-4 cursor-se-resize',
            'hover:bg-black/10 dark:hover:bg-white/10 rounded-br-md'
          )}
          onMouseDown={handleResizeStart}
        >
          <svg
            className="w-4 h-4 text-muted-foreground/30"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              d="M11 11v-1h1v1h-1zm-2 0v-1h1v1h-1zm4 0v-1h1v1h-1zm-6 2v-1h1v1h-1zm2 0v-1h1v1h-1zm2 0v-1h1v1h-1zm2 0v-1h1v1h-1zm2-4v-1h1v1h-1zm0 2v-1h1v1h-1zm0 2v-1h1v1h-1z"
            />
          </svg>
        </div>
      </div>
    </TooltipProvider>
  );
}

// ============================================
// STICKY NOTE LAYER
// ============================================

interface StickyNoteLayerProps {
  notes: StickyNoteData[];
  selectedNoteId?: string | null;
  zoom?: number;
  onSelectNote?: (noteId: string | null) => void;
  onUpdateNote?: (noteId: string, updates: Partial<StickyNoteData>) => void;
  onDuplicateNote?: (noteId: string) => void;
  onDeleteNote?: (noteId: string) => void;
  className?: string;
}

export function StickyNoteLayer({
  notes,
  selectedNoteId,
  zoom = 1,
  onSelectNote,
  onUpdateNote,
  onDuplicateNote,
  onDeleteNote,
  className,
}: StickyNoteLayerProps) {
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, noteX: 0, noteY: 0 });

  // Handle drag
  useEffect(() => {
    if (!draggingNoteId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      
      onUpdateNote?.(draggingNoteId, {
        position: {
          x: dragStart.noteX + deltaX,
          y: dragStart.noteY + deltaY,
        },
      });
    };

    const handleMouseUp = () => {
      setDraggingNoteId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNoteId, dragStart, zoom, onUpdateNote]);

  return (
    <div className={cn('absolute inset-0 pointer-events-none', className)}>
      {notes.map((note) => (
        <div key={note.id} className="pointer-events-auto">
          <StickyNote
            note={note}
            isSelected={selectedNoteId === note.id}
            isDragging={draggingNoteId === note.id}
            zoom={zoom}
            onSelect={() => onSelectNote?.(note.id)}
            onContentChange={(content) => onUpdateNote?.(note.id, { content })}
            onColorChange={(color) => onUpdateNote?.(note.id, { color })}
            onSizeChange={(size) => onUpdateNote?.(note.id, { size })}
            onDuplicate={() => onDuplicateNote?.(note.id)}
            onDelete={() => onDeleteNote?.(note.id)}
            onDragStart={(e) => {
              setDraggingNoteId(note.id);
              setDragStart({
                x: e.clientX,
                y: e.clientY,
                noteX: note.position.x,
                noteY: note.position.y,
              });
            }}
            onDragEnd={() => setDraggingNoteId(null)}
          />
        </div>
      ))}
    </div>
  );
}

export default StickyNote;
