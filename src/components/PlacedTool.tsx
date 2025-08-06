import React from 'react';
import { Tool } from '@/types/tools';
import { Hammer, Wrench, Scissors, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlacedToolProps {
  tool: Tool;
  cellSize: number;
  isSelected: boolean;
  onSelect: (multiSelect: boolean) => void;
  onDragStart: (tool: Tool) => void;
}

const getToolIcon = (type: Tool['type']) => {
  switch (type) {
    case 'hammer': return Hammer;
    case 'screwdriver': return Wrench;
    case 'pliers': return Scissors;
    default: return Wrench;
  }
};

const getToolColor = (type: Tool['type']) => {
  switch (type) {
    case 'hammer': return 'from-amber-600 to-amber-800';
    case 'screwdriver': return 'from-orange-500 to-red-600';
    case 'pliers': return 'from-blue-500 to-blue-700';
    default: return 'from-gray-500 to-gray-700';
  }
};

export const PlacedTool: React.FC<PlacedToolProps> = ({
  tool,
  cellSize,
  isSelected,
  onSelect,
  onDragStart
}) => {
  const Icon = getToolIcon(tool.type);
  const toolColorClass = getToolColor(tool.type);
  
  if (!tool.position) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e.shiftKey);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('toolId', tool.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(tool);
  };

  // Calculate tool dimensions
  const toolWidth = Math.max(...tool.shape.map(row => row.length)) * cellSize;
  const toolHeight = tool.shape.length * cellSize;

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-200 group ${
        isSelected ? 'z-20' : 'z-10'
      }`}
      style={{
        left: tool.position.x * cellSize,
        top: tool.position.y * cellSize,
        width: toolWidth,
        height: toolHeight
      }}
      onClick={handleClick}
      draggable
      onDragStart={handleDragStart}
    >
      {/* Tool shape */}
      <div className="relative w-full h-full">
        {tool.shape.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`relative transition-all duration-200 ${
                  cell === 1
                    ? `bg-gradient-to-br ${toolColorClass} border border-white/20 shadow-md`
                    : 'bg-transparent'
                } ${
                  isSelected 
                    ? 'ring-2 ring-primary ring-offset-1 ring-offset-pegboard shadow-lg transform scale-105' 
                    : 'hover:shadow-lg hover:transform hover:scale-105'
                }`}
                style={{
                  width: cellSize,
                  height: cellSize
                }}
              >
                {/* Tool icon (only show on the center cell) */}
                {cell === 1 && rowIndex === Math.floor(tool.shape.length / 2) && 
                 colIndex === Math.floor(row.length / 2) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-white drop-shadow-sm" />
                  </div>
                )}
                
                {/* Realistic tool texture */}
                {cell === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-50" />
                )}
              </div>
            ))}
          </div>
        ))}
        
        {/* Tool label on hover */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30">
          {tool.name}
        </div>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -inset-1 border-2 border-primary rounded bg-primary/10 pointer-events-none" />
        )}
        
        {/* Rotation button (shown on hover for selected tools) */}
        {isSelected && (
          <Button
            size="sm"
            variant="secondary"
            className="absolute -top-6 -right-6 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement rotation
            }}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};