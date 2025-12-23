/**
 * Context Menu Component
 * 
 * A flexible context menu system for the flow builder
 * with node, connection, and canvas context options.
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Copy,
  Trash2,
  Settings2,
  Play,
  Pencil,
  Power,
  PowerOff,
  Plus,
  Scissors,
  Clipboard,
  MousePointer2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  LayoutGrid,
  AlignCenterHorizontal,
  AlignCenterVertical,
  GitBranch,
  Zap,
  ArrowRight,
  Clock,
  ExternalLink,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  shortcut?: string;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

export interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  items: ContextMenuItem[];
  onClose: () => void;
  className?: string;
}

// ============================================
// CONTEXT MENU COMPONENT
// ============================================

export const ContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  position,
  items,
  onClose,
  className,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth - 10) {
      x = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight - 10) {
      y = viewportHeight - rect.height - 10;
    }

    setAdjustedPosition({ x: Math.max(10, x), y: Math.max(10, y) });
  }, [isOpen, position]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderItem = (item: ContextMenuItem, index: number) => {
    if (item.separator) {
      return <div key={`sep-${index}`} className="h-px bg-border my-1" />;
    }

    const Icon = item.icon;
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={() => hasSubmenu && setActiveSubmenu(item.id)}
        onMouseLeave={() => hasSubmenu && setActiveSubmenu(null)}
      >
        <button
          className={cn(
            "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md",
            "transition-colors duration-75",
            item.disabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-accent cursor-pointer",
            item.danger && !item.disabled && "text-destructive hover:bg-destructive/10"
          )}
          onClick={() => {
            if (!item.disabled && item.onClick) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
        >
          {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
          <span className="flex-1 text-left">{item.label}</span>
          {item.shortcut && (
            <span className="text-xs text-muted-foreground ml-4">
              {item.shortcut}
            </span>
          )}
          {hasSubmenu && (
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          )}
        </button>

        {/* Submenu */}
        {hasSubmenu && activeSubmenu === item.id && (
          <div
            className={cn(
              "absolute left-full top-0 ml-1 min-w-[180px]",
              "bg-popover border rounded-lg shadow-lg py-1 z-50"
            )}
          >
            {item.submenu!.map((subItem, subIndex) => renderItem(subItem, subIndex))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-[100] min-w-[200px] py-1",
        "bg-popover border rounded-lg shadow-xl",
        "animate-in fade-in-0 zoom-in-95 duration-100",
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
    >
      {items.map((item, index) => renderItem(item, index))}
    </div>
  );
};

// ============================================
// PRESET MENU BUILDERS
// ============================================

export const buildNodeContextMenu = (options: {
  onConfigure?: () => void;
  onTest?: () => void;
  onRename?: () => void;
  onDuplicate?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onToggleEnabled?: () => void;
  onDelete?: () => void;
  isEnabled?: boolean;
  canTest?: boolean;
}): ContextMenuItem[] => [
  {
    id: 'configure',
    label: 'Configure',
    icon: Settings2,
    shortcut: '⏎',
    onClick: options.onConfigure,
  },
  {
    id: 'test',
    label: 'Test Step',
    icon: Play,
    onClick: options.onTest,
    disabled: !options.canTest,
  },
  { id: 'sep1', label: '', separator: true },
  {
    id: 'rename',
    label: 'Rename',
    icon: Pencil,
    shortcut: 'F2',
    onClick: options.onRename,
  },
  {
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    shortcut: '⌘D',
    onClick: options.onDuplicate,
  },
  {
    id: 'cut',
    label: 'Cut',
    icon: Scissors,
    shortcut: '⌘X',
    onClick: options.onCut,
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: Clipboard,
    shortcut: '⌘C',
    onClick: options.onCopy,
  },
  { id: 'sep2', label: '', separator: true },
  {
    id: 'toggle',
    label: options.isEnabled ? 'Disable' : 'Enable',
    icon: options.isEnabled ? PowerOff : Power,
    onClick: options.onToggleEnabled,
  },
  { id: 'sep3', label: '', separator: true },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    shortcut: '⌫',
    onClick: options.onDelete,
    danger: true,
  },
];

export const buildConnectionContextMenu = (options: {
  onDelete?: () => void;
}): ContextMenuItem[] => [
  {
    id: 'delete',
    label: 'Delete Connection',
    icon: Trash2,
    shortcut: '⌫',
    onClick: options.onDelete,
    danger: true,
  },
];

export const buildCanvasContextMenu = (options: {
  onAddTrigger?: () => void;
  onAddAction?: () => void;
  onAddCondition?: () => void;
  onAddDelay?: () => void;
  onPaste?: () => void;
  onSelectAll?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onToggleGrid?: () => void;
  onAutoLayout?: () => void;
  canPaste?: boolean;
}): ContextMenuItem[] => [
  {
    id: 'add',
    label: 'Add Node',
    icon: Plus,
    submenu: [
      {
        id: 'add-trigger',
        label: 'Trigger',
        icon: Zap,
        onClick: options.onAddTrigger,
      },
      {
        id: 'add-action',
        label: 'Action',
        icon: ArrowRight,
        onClick: options.onAddAction,
      },
      {
        id: 'add-condition',
        label: 'Condition',
        icon: GitBranch,
        onClick: options.onAddCondition,
      },
      {
        id: 'add-delay',
        label: 'Delay',
        icon: Clock,
        onClick: options.onAddDelay,
      },
    ],
  },
  { id: 'sep1', label: '', separator: true },
  {
    id: 'paste',
    label: 'Paste',
    icon: Clipboard,
    shortcut: '⌘V',
    onClick: options.onPaste,
    disabled: !options.canPaste,
  },
  {
    id: 'select-all',
    label: 'Select All',
    icon: MousePointer2,
    shortcut: '⌘A',
    onClick: options.onSelectAll,
  },
  { id: 'sep2', label: '', separator: true },
  {
    id: 'view',
    label: 'View',
    icon: ExternalLink,
    submenu: [
      {
        id: 'zoom-in',
        label: 'Zoom In',
        icon: ZoomIn,
        shortcut: '⌘+',
        onClick: options.onZoomIn,
      },
      {
        id: 'zoom-out',
        label: 'Zoom Out',
        icon: ZoomOut,
        shortcut: '⌘-',
        onClick: options.onZoomOut,
      },
      {
        id: 'fit-view',
        label: 'Fit View',
        icon: Maximize2,
        shortcut: '⌘0',
        onClick: options.onFitView,
      },
      { id: 'sep', label: '', separator: true },
      {
        id: 'toggle-grid',
        label: 'Toggle Grid',
        icon: LayoutGrid,
        shortcut: 'G',
        onClick: options.onToggleGrid,
      },
    ],
  },
  { id: 'sep3', label: '', separator: true },
  {
    id: 'auto-layout',
    label: 'Auto Layout',
    icon: AlignCenterHorizontal,
    onClick: options.onAutoLayout,
  },
];

export const buildMultiSelectContextMenu = (options: {
  selectedCount: number;
  onDuplicate?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onAlignHorizontal?: () => void;
  onAlignVertical?: () => void;
  onGroup?: () => void;
}): ContextMenuItem[] => [
  {
    id: 'info',
    label: `${options.selectedCount} nodes selected`,
    disabled: true,
  },
  { id: 'sep1', label: '', separator: true },
  {
    id: 'duplicate',
    label: 'Duplicate All',
    icon: Copy,
    shortcut: '⌘D',
    onClick: options.onDuplicate,
  },
  {
    id: 'cut',
    label: 'Cut',
    icon: Scissors,
    shortcut: '⌘X',
    onClick: options.onCut,
  },
  {
    id: 'copy',
    label: 'Copy',
    icon: Clipboard,
    shortcut: '⌘C',
    onClick: options.onCopy,
  },
  { id: 'sep2', label: '', separator: true },
  {
    id: 'align',
    label: 'Align',
    icon: AlignCenterHorizontal,
    submenu: [
      {
        id: 'align-h',
        label: 'Align Horizontally',
        icon: AlignCenterHorizontal,
        onClick: options.onAlignHorizontal,
      },
      {
        id: 'align-v',
        label: 'Align Vertically',
        icon: AlignCenterVertical,
        onClick: options.onAlignVertical,
      },
    ],
  },
  { id: 'sep3', label: '', separator: true },
  {
    id: 'delete',
    label: 'Delete All',
    icon: Trash2,
    shortcut: '⌫',
    onClick: options.onDelete,
    danger: true,
  },
];

export default ContextMenu;
