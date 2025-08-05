import React, { useState, useCallback, useRef } from 'react';
import { Tool, PegboardState, DragState, TOOL_TEMPLATES } from '@/types/tools';
import { ToolsPanel } from './ToolsPanel';
import { PegboardGrid } from './PegboardGrid';
import { Toolbar } from './Toolbar';
import { toast } from 'sonner';

const INITIAL_GRID_SIZE = { width: 20, height: 15 };
const CELL_SIZE = 30;

export const PegboardEditor: React.FC = () => {
  const [pegboardState, setPegboardState] = useState<PegboardState>({
    tools: [],
    selectedToolIds: [],
    gridSize: INITIAL_GRID_SIZE,
    cellSize: CELL_SIZE
  });

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTool: null,
    previewPosition: null
  });

  const [history, setHistory] = useState<PegboardState[]>([pegboardState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const saveToHistory = useCallback((newState: PegboardState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setPegboardState(history[newIndex]);
      toast("Undid last action");
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setPegboardState(history[newIndex]);
      toast("Redid action");
    }
  }, [history, historyIndex]);

  const generateToolId = () => `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleToolDragStart = useCallback((tool: Tool) => {
    setDragState({
      isDragging: true,
      draggedTool: tool,
      previewPosition: null
    });
  }, []);

  const handleToolDrop = useCallback((position: { x: number; y: number }) => {
    if (!dragState.draggedTool) return;

    // Check if position is valid (no collisions)
    if (isValidPosition(dragState.draggedTool, position)) {
      const newTool: Tool = {
        ...dragState.draggedTool,
        id: generateToolId(),
        position
      };

      const newState = {
        ...pegboardState,
        tools: [...pegboardState.tools, newTool],
        selectedToolIds: [newTool.id]
      };

      setPegboardState(newState);
      saveToHistory(newState);
      toast(`${newTool.name} placed on pegboard`);
    } else {
      toast("Cannot place tool here - position occupied", { 
        description: "Try a different location" 
      });
    }

    setDragState({
      isDragging: false,
      draggedTool: null,
      previewPosition: null
    });
  }, [dragState.draggedTool, pegboardState, saveToHistory]);

  const isValidPosition = (tool: Tool, position: { x: number; y: number }): boolean => {
    const { shape } = tool;
    
    // Check grid boundaries
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const gridX = position.x + col;
          const gridY = position.y + row;
          
          if (gridX < 0 || gridX >= pegboardState.gridSize.width ||
              gridY < 0 || gridY >= pegboardState.gridSize.height) {
            return false;
          }
          
          // Check for collisions with existing tools
          const collision = pegboardState.tools.some(existingTool => {
            if (!existingTool.position) return false;
            
            for (let eRow = 0; eRow < existingTool.shape.length; eRow++) {
              for (let eCol = 0; eCol < existingTool.shape[eRow].length; eCol++) {
                if (existingTool.shape[eRow][eCol] === 1) {
                  const eGridX = existingTool.position.x + eCol;
                  const eGridY = existingTool.position.y + eRow;
                  
                  if (eGridX === gridX && eGridY === gridY) {
                    return true;
                  }
                }
              }
            }
            return false;
          });
          
          if (collision) return false;
        }
      }
    }
    
    return true;
  };

  const handleToolSelect = useCallback((toolId: string, multiSelect: boolean = false) => {
    setPegboardState(prev => {
      if (multiSelect) {
        const isSelected = prev.selectedToolIds.includes(toolId);
        return {
          ...prev,
          selectedToolIds: isSelected 
            ? prev.selectedToolIds.filter(id => id !== toolId)
            : [...prev.selectedToolIds, toolId]
        };
      } else {
        return {
          ...prev,
          selectedToolIds: [toolId]
        };
      }
    });
  }, []);

  const handleToolDelete = useCallback((toolIds: string[]) => {
    const newState = {
      ...pegboardState,
      tools: pegboardState.tools.filter(tool => !toolIds.includes(tool.id)),
      selectedToolIds: pegboardState.selectedToolIds.filter(id => !toolIds.includes(id))
    };
    
    setPegboardState(newState);
    saveToHistory(newState);
    toast(`Deleted ${toolIds.length} tool(s)`);
  }, [pegboardState, saveToHistory]);

  const clearPegboard = useCallback(() => {
    const newState = {
      ...pegboardState,
      tools: [],
      selectedToolIds: []
    };
    
    setPegboardState(newState);
    saveToHistory(newState);
    toast("Pegboard cleared");
  }, [pegboardState, saveToHistory]);

  return (
    <div className="h-screen bg-background flex flex-col">
      <Toolbar 
        onUndo={undo}
        onRedo={redo}
        onClear={clearPegboard}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        selectedCount={pegboardState.selectedToolIds.length}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <ToolsPanel 
          tools={TOOL_TEMPLATES}
          onToolDragStart={handleToolDragStart}
          onDeleteTools={handleToolDelete}
          selectedToolIds={pegboardState.selectedToolIds}
        />
        
        <div className="flex-1 p-4">
          <PegboardGrid
            ref={gridRef}
            pegboardState={pegboardState}
            dragState={dragState}
            onToolDrop={handleToolDrop}
            onToolSelect={handleToolSelect}
            onToolDelete={handleToolDelete}
            onDragPreview={(position) => setDragState(prev => ({ ...prev, previewPosition: position }))}
          />
        </div>
      </div>
    </div>
  );
};