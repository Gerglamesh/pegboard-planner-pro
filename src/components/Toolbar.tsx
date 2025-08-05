import React from 'react';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2, Trash2, Save, Download } from 'lucide-react';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  selectedCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  selectedCount
}) => {
  return (
    <div className="bg-card border-b border-border p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-primary">Pegboard Organizer</h1>
        <span className="text-sm text-muted-foreground">
          Professional Tool Organization System
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <span className="text-sm text-muted-foreground px-2 py-1 bg-secondary rounded">
            {selectedCount} selected
          </span>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="gap-1"
        >
          <Undo2 className="h-4 w-4" />
          Undo
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="gap-1"
        >
          <Redo2 className="h-4 w-4" />
          Redo
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Save className="h-4 w-4" />
          Save
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onClear}
          className="gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Clear All
        </Button>
      </div>
    </div>
  );
};