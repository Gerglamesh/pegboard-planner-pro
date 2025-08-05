import React from 'react';
import { Tool } from '@/types/tools';
import { Card } from '@/components/ui/card';
import { Hammer, Wrench, Scissors } from 'lucide-react';

interface ToolItemProps {
  tool: Omit<Tool, 'id' | 'position'>;
  onDragStart: (tool: Tool) => void;
  isPlaced?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
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
    case 'hammer': return 'bg-gradient-to-br from-amber-600 to-amber-800';
    case 'screwdriver': return 'bg-gradient-to-br from-orange-500 to-red-600';
    case 'pliers': return 'bg-gradient-to-br from-blue-500 to-blue-700';
    default: return 'bg-gradient-to-br from-gray-500 to-gray-700';
  }
};

export const ToolItem: React.FC<ToolItemProps> = ({ 
  tool, 
  onDragStart, 
  isPlaced = false,
  isSelected = false,
  onClick 
}) => {
  const Icon = getToolIcon(tool.type);
  const toolColorClass = getToolColor(tool.type);
  
  const generateToolId = () => `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleDragStart = (e: React.DragEvent) => {
    const toolWithId: Tool = {
      ...tool,
      id: generateToolId()
    };
    
    onDragStart(toolWithId);
    e.dataTransfer.setData('toolId', toolWithId.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const renderToolShape = () => {
    const { shape } = tool;
    const cellSize = 6; // Small cells for preview
    
    return (
      <div className="flex flex-col items-center gap-0.5 mt-2">
        {shape.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-0.5">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`w-${cellSize} h-${cellSize} rounded-sm ${
                  cell === 1 
                    ? 'bg-white/80 shadow-sm' 
                    : 'bg-transparent'
                }`}
                style={{
                  width: `${cellSize * 4}px`,
                  height: `${cellSize * 4}px`
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card 
      className={`
        relative cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-primary shadow-lg' : ''}
        ${isPlaced ? 'opacity-75' : 'hover:scale-105'}
      `}
      draggable={!isPlaced}
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <div className={`${toolColorClass} p-3 rounded-t-lg`}>
        <Icon className="h-6 w-6 text-white mx-auto" />
        {renderToolShape()}
      </div>
      
      <div className="p-2">
        <h3 className="text-xs font-medium text-center leading-tight">
          {tool.name}
        </h3>
        <p className="text-xs text-muted-foreground text-center capitalize mt-1">
          {tool.type}
        </p>
      </div>
      
      {isPlaced && (
        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
            In Use
          </span>
        </div>
      )}
    </Card>
  );
};