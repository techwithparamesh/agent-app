/**
 * Keyboard Shortcuts Hook
 * 
 * Manages all keyboard shortcuts for the flow builder
 * with proper key combination detection and conflict handling.
 */

import { useEffect, useCallback, useRef } from 'react';

// ============================================
// TYPES
// ============================================

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
  allowInInput?: boolean;
}

export interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts: ShortcutConfig[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const normalizeKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    'Delete': 'Backspace',
    'Del': 'Backspace',
    'Esc': 'Escape',
    'Up': 'ArrowUp',
    'Down': 'ArrowDown',
    'Left': 'ArrowLeft',
    'Right': 'ArrowRight',
  };
  return keyMap[key] || key;
};

const matchesShortcut = (e: KeyboardEvent, shortcut: ShortcutConfig): boolean => {
  const key = normalizeKey(shortcut.key);
  
  // Check key match (case-insensitive)
  if (e.key.toLowerCase() !== key.toLowerCase() && e.code !== key) {
    return false;
  }
  
  // Check modifiers
  if (shortcut.ctrl !== undefined && e.ctrlKey !== shortcut.ctrl) return false;
  if (shortcut.shift !== undefined && e.shiftKey !== shortcut.shift) return false;
  if (shortcut.alt !== undefined && e.altKey !== shortcut.alt) return false;
  if (shortcut.meta !== undefined && e.metaKey !== shortcut.meta) return false;
  
  return true;
};

const isInputElement = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
};

// ============================================
// MAIN HOOK
// ============================================

export function useKeyboardShortcuts({
  enabled = true,
  shortcuts,
}: UseKeyboardShortcutsOptions) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    
    // Check if we're in an input field
    const inInput = isInputElement(e.target);
    
    for (const shortcut of shortcutsRef.current) {
      if (matchesShortcut(e, shortcut)) {
        // Skip if in input and not allowed
        if (inInput && !shortcut.allowInInput) continue;
        
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        shortcut.action();
        return;
      }
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// ============================================
// PRESET SHORTCUTS BUILDER
// ============================================

export interface FlowShortcutActions {
  onUndo?: () => void;
  onRedo?: () => void;
  onCut?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onSelectAll?: () => void;
  onDuplicate?: () => void;
  onEscape?: () => void;
  onSave?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
  onToggleGrid?: () => void;
  onFocusSearch?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}

export const buildFlowShortcuts = (actions: FlowShortcutActions): ShortcutConfig[] => {
  const shortcuts: ShortcutConfig[] = [];

  // Undo/Redo
  if (actions.onUndo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      shift: false,
      action: actions.onUndo,
      description: 'Undo',
    });
  }

  if (actions.onRedo) {
    shortcuts.push({
      key: 'z',
      ctrl: true,
      shift: true,
      action: actions.onRedo,
      description: 'Redo',
    });
    shortcuts.push({
      key: 'y',
      ctrl: true,
      action: actions.onRedo,
      description: 'Redo',
    });
  }

  // Clipboard
  if (actions.onCut) {
    shortcuts.push({
      key: 'x',
      ctrl: true,
      action: actions.onCut,
      description: 'Cut',
    });
  }

  if (actions.onCopy) {
    shortcuts.push({
      key: 'c',
      ctrl: true,
      action: actions.onCopy,
      description: 'Copy',
    });
  }

  if (actions.onPaste) {
    shortcuts.push({
      key: 'v',
      ctrl: true,
      action: actions.onPaste,
      description: 'Paste',
    });
  }

  // Delete
  if (actions.onDelete) {
    shortcuts.push({
      key: 'Backspace',
      action: actions.onDelete,
      description: 'Delete selected',
    });
    shortcuts.push({
      key: 'Delete',
      action: actions.onDelete,
      description: 'Delete selected',
    });
  }

  // Select all
  if (actions.onSelectAll) {
    shortcuts.push({
      key: 'a',
      ctrl: true,
      action: actions.onSelectAll,
      description: 'Select all',
    });
  }

  // Duplicate
  if (actions.onDuplicate) {
    shortcuts.push({
      key: 'd',
      ctrl: true,
      action: actions.onDuplicate,
      description: 'Duplicate',
    });
  }

  // Escape
  if (actions.onEscape) {
    shortcuts.push({
      key: 'Escape',
      action: actions.onEscape,
      description: 'Cancel / Deselect',
      allowInInput: true,
    });
  }

  // Save
  if (actions.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      action: actions.onSave,
      description: 'Save',
    });
  }

  // Zoom
  if (actions.onZoomIn) {
    shortcuts.push({
      key: '=',
      ctrl: true,
      action: actions.onZoomIn,
      description: 'Zoom in',
    });
    shortcuts.push({
      key: '+',
      ctrl: true,
      action: actions.onZoomIn,
      description: 'Zoom in',
    });
  }

  if (actions.onZoomOut) {
    shortcuts.push({
      key: '-',
      ctrl: true,
      action: actions.onZoomOut,
      description: 'Zoom out',
    });
  }

  if (actions.onFitView) {
    shortcuts.push({
      key: '0',
      ctrl: true,
      action: actions.onFitView,
      description: 'Fit view',
    });
  }

  // Grid toggle
  if (actions.onToggleGrid) {
    shortcuts.push({
      key: 'g',
      action: actions.onToggleGrid,
      description: 'Toggle grid',
    });
  }

  // Search
  if (actions.onFocusSearch) {
    shortcuts.push({
      key: 'f',
      ctrl: true,
      action: actions.onFocusSearch,
      description: 'Search',
    });
    shortcuts.push({
      key: '/',
      action: actions.onFocusSearch,
      description: 'Search',
    });
  }

  // Arrow key movement
  if (actions.onMoveUp) {
    shortcuts.push({
      key: 'ArrowUp',
      action: actions.onMoveUp,
      description: 'Move up',
    });
  }

  if (actions.onMoveDown) {
    shortcuts.push({
      key: 'ArrowDown',
      action: actions.onMoveDown,
      description: 'Move down',
    });
  }

  if (actions.onMoveLeft) {
    shortcuts.push({
      key: 'ArrowLeft',
      action: actions.onMoveLeft,
      description: 'Move left',
    });
  }

  if (actions.onMoveRight) {
    shortcuts.push({
      key: 'ArrowRight',
      action: actions.onMoveRight,
      description: 'Move right',
    });
  }

  return shortcuts;
};

// ============================================
// SHORTCUTS HELP COMPONENT DATA
// ============================================

export interface ShortcutCategory {
  name: string;
  shortcuts: Array<{
    keys: string[];
    description: string;
  }>;
}

export const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      { keys: ['Ctrl', 'S'], description: 'Save flow' },
      { keys: ['Ctrl', 'Z'], description: 'Undo' },
      { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
      { keys: ['Escape'], description: 'Cancel / Close panel' },
      { keys: ['Ctrl', 'F'], description: 'Search' },
    ],
  },
  {
    name: 'Selection',
    shortcuts: [
      { keys: ['Ctrl', 'A'], description: 'Select all' },
      { keys: ['Click'], description: 'Select node' },
      { keys: ['Shift', 'Click'], description: 'Add to selection' },
      { keys: ['Ctrl', 'Click'], description: 'Toggle selection' },
      { keys: ['Drag'], description: 'Box select' },
    ],
  },
  {
    name: 'Editing',
    shortcuts: [
      { keys: ['Delete'], description: 'Delete selected' },
      { keys: ['Ctrl', 'D'], description: 'Duplicate' },
      { keys: ['Ctrl', 'C'], description: 'Copy' },
      { keys: ['Ctrl', 'X'], description: 'Cut' },
      { keys: ['Ctrl', 'V'], description: 'Paste' },
    ],
  },
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['Ctrl', '+'], description: 'Zoom in' },
      { keys: ['Ctrl', '-'], description: 'Zoom out' },
      { keys: ['Ctrl', '0'], description: 'Reset zoom' },
      { keys: ['Space', 'Drag'], description: 'Pan canvas' },
      { keys: ['G'], description: 'Toggle grid' },
    ],
  },
  {
    name: 'Nodes',
    shortcuts: [
      { keys: ['Enter'], description: 'Configure selected node' },
      { keys: ['↑', '↓', '←', '→'], description: 'Move selected nodes' },
      { keys: ['Double-click'], description: 'Open node config' },
      { keys: ['Right-click'], description: 'Context menu' },
    ],
  },
];

export default useKeyboardShortcuts;
