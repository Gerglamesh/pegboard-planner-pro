import React, { forwardRef, useState, useCallback, useRef, useEffect } from 'react';
import { Tool, PegboardState, DragState } from '@/types/tools';
import { PlacedTool } from './PlacedTool';

interface PegboardGridProps {
  pegboardState: PegboardState;
  dragState: DragState;
  onToolDrop: (position: { x: number; y: number }) => void;
  onToolSelect: (toolId: string, multiSelect?: boolean) => void;
  onToolDelete: (toolIds: string[]) => void;
  onDragPreview: (position: { x: number; y: number } | null) => void;
}

export const PegboardGrid = forwardRef<HTMLDivElement, PegboardGridProps>(({
  pegboardState,
  dragState,
  onToolDrop,
  onToolSelect,
  onToolDelete,
  onDragPreview
}, ref) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { gridSize, cellSize, tools, selectedToolIds } = pegboardState;
  const { isDragging, draggedTool, previewPosition } = dragState;

  const getGridPosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / cellSize);
    const y = Math.floor((clientY - rect.top) / cellSize);
    
    return { x, y };
  }, [cellSize]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const position = getGridPosition(e.clientX, e.clientY);
    if (position) {
      onDragPreview(position);
    }
  }, [getGridPosition, onDragPreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const position = getGridPosition(e.clientX, e.clientY);
    if (position) {
      onToolDrop(position);
    }
    onDragPreview(null);
  }, [getGridPosition, onToolDrop, onDragPreview]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!e.shiftKey || isDragging) return;
    
    const position = getGridPosition(e.clientX, e.clientY);
    if (position) {
      setIsSelecting(true);
      setSelectionStart(position);
      setSelectionEnd(position);
    }
  }, [getGridPosition, isDragging]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart) return;
    
    const position = getGridPosition(e.clientX, e.clientY);
    if (position) {
      setSelectionEnd(position);
    }
  }, [getGridPosition, isSelecting, selectionStart]);

  const handleMouseUp = useCallback(() => {
    if (isSelecting && selectionStart && selectionEnd) {
      // Find tools within selection rectangle
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      
      const selectedTools = tools.filter(tool => {
        if (!tool.position) return false;
        
        // Check if any part of the tool overlaps with selection
        for (let row = 0; row < tool.shape.length; row++) {
          for (let col = 0; col < tool.shape[row].length; col++) {
            if (tool.shape[row][col] === 1) {
              const toolX = tool.position.x + col;
              const toolY = tool.position.y + row;
              
              if (toolX >= minX && toolX <= maxX && toolY >= minY && toolY <= maxY) {
                return true;
              }
            }
          }
        }
        return false;
      });
      
      // Select the tools
      selectedTools.forEach(tool => onToolSelect(tool.id, true));
    }
    
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  }, [isSelecting, selectionStart, selectionEnd, tools, onToolSelect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedToolIds.length > 0) {
        onToolDelete(selectedToolIds);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedToolIds, onToolDelete]);

  const renderGrid = () => {
    const gridLines = [];
    
    // Vertical lines
    for (let x = 0; x <= gridSize.width; x++) {
      gridLines.push(
        <line
          key={`v-${x}`}
          x1={x * cellSize}
          y1={0}
          x2={x * cellSize}
          y2={gridSize.height * cellSize}
          stroke="currentColor"
          strokeWidth="1"
          className="text-grid opacity-30"
        />
      );
    }
    
    // Horizontal lines
    for (let y = 0; y <= gridSize.height; y++) {
      gridLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y * cellSize}
          x2={gridSize.width * cellSize}
          y2={y * cellSize}
          stroke="currentColor"
          strokeWidth="1"
          className="text-grid opacity-30"
        />
      );
    }
    
    return gridLines;
  };

  const renderPegboardHoles = () => {
    const holes = [];
    
    for (let x = 0; x < gridSize.width; x++) {
      for (let y = 0; y < gridSize.height; y++) {
        holes.push(
          <circle
            key={`hole-${x}-${y}`}
            cx={x * cellSize + cellSize / 2}
            cy={y * cellSize + cellSize / 2}
            r="3"
            className="fill-pegboard-hole"
          />
        );
      }
    }
    
    return holes;
  };

  const renderPreview = () => {
    if (!isDragging || !draggedTool || !previewPosition) return null;
    
    const isValid = isValidPreviewPosition(draggedTool, previewPosition);
    
    return (
      <div
        className={`absolute pointer-events-none transition-opacity duration-150 ${
          isValid ? 'opacity-70' : 'opacity-40'
        }`}
        style={{
          left: previewPosition.x * cellSize,
          top: previewPosition.y * cellSize,
          zIndex: 1000
        }}
      >
        <div className="relative">
          {draggedTool.shape.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`border ${
                    cell === 1
                      ? isValid
                        ? 'bg-drop-zone/50 border-drop-zone'
                        : 'bg-destructive/50 border-destructive'
                      : 'border-transparent'
                  }`}
                  style={{
                    width: cellSize,
                    height: cellSize
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const isValidPreviewPosition = (tool: Tool, position: { x: number; y: number }): boolean => {
    const { shape } = tool;
    
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col] === 1) {
          const gridX = position.x + col;
          const gridY = position.y + row;
          
          if (gridX < 0 || gridX >= gridSize.width ||
              gridY < 0 || gridY >= gridSize.height) {
            return false;
          }
          
          const collision = tools.some(existingTool => {
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

  const renderSelectionBox = () => {
    if (!isSelecting || !selectionStart || !selectionEnd) return null;
    
    const minX = Math.min(selectionStart.x, selectionEnd.x) * cellSize;
    const maxX = Math.max(selectionStart.x, selectionEnd.x) * cellSize + cellSize;
    const minY = Math.min(selectionStart.y, selectionEnd.y) * cellSize;
    const maxY = Math.max(selectionStart.y, selectionEnd.y) * cellSize + cellSize;
    
    return (
      <div
        className="absolute border-2 border-dashed border-selection-box bg-selection-box/10 pointer-events-none"
        style={{
          left: minX,
          top: minY,
          width: maxX - minX,
          height: maxY - minY,
          zIndex: 1001
        }}
      />
    );
  };

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="inline-block bg-pegboard rounded-lg shadow-2xl border border-border">
        <div
          ref={containerRef}
          className="relative bg-gradient-to-br from-pegboard to-pegboard-shadow"
          style={{
            width: gridSize.width * cellSize,
            height: gridSize.height * cellSize
          }}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Background pattern */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={gridSize.width * cellSize}
            height={gridSize.height * cellSize}
          >
            <defs>
              <pattern
                id="pegboard-pattern"
                x="0"
                y="0"
                width={cellSize}
                height={cellSize}
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx={cellSize / 2}
                  cy={cellSize / 2}
                  r="3"
                  className="fill-pegboard-hole"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#pegboard-pattern)"
            />
          </svg>

          {/* Grid overlay */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={gridSize.width * cellSize}
            height={gridSize.height * cellSize}
          >
            {renderGrid()}
          </svg>

          {/* Placed tools */}
          {tools.map(tool => (
            tool.position && (
              <PlacedTool
                key={tool.id}
                tool={tool}
                cellSize={cellSize}
                isSelected={selectedToolIds.includes(tool.id)}
                onSelect={(multiSelect) => onToolSelect(tool.id, multiSelect)}
              />
            )
          ))}

          {/* Drag preview */}
          {renderPreview()}

          {/* Selection box */}
          {renderSelectionBox()}
        </div>
      </div>
    </div>
  );
});