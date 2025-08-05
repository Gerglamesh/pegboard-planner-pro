import React, { useState } from 'react';
import { Tool } from '@/types/tools';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Trash2 } from 'lucide-react';
import { ToolItem } from './ToolItem';

interface ToolsPanelProps {
  tools: Omit<Tool, 'id' | 'position'>[];
  onToolDragStart: (tool: Tool) => void;
  onDeleteTools: (toolIds: string[]) => void;
  selectedToolIds: string[];
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  tools,
  onToolDragStart,
  onDeleteTools,
  selectedToolIds
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDragOverTrash, setIsDragOverTrash] = useState(false);

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toolsByType = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.type]) acc[tool.type] = [];
    acc[tool.type].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTrash(true);
  };

  const handleDragLeave = () => {
    setIsDragOverTrash(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTrash(false);
    
    const toolId = e.dataTransfer.getData('toolId');
    if (toolId && selectedToolIds.includes(toolId)) {
      onDeleteTools(selectedToolIds);
    } else if (toolId) {
      onDeleteTools([toolId]);
    }
  };

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-3">Available Tools</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tools List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(toolsByType).map(([type, typeTools]) => (
          <div key={type} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {type}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {typeTools.length} tools
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {typeTools.map((tool, index) => (
                <ToolItem
                  key={`${tool.type}-${index}`}
                  tool={tool}
                  onDragStart={onToolDragStart}
                />
              ))}
            </div>
          </div>
        ))}
        
        {filteredTools.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tools found</p>
            <p className="text-sm">Try adjusting your search</p>
          </div>
        )}
      </div>

      {/* Trash Bin */}
      <div 
        className={`m-4 p-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragOverTrash 
            ? 'border-destructive bg-destructive/10' 
            : 'border-muted-foreground/30 hover:border-destructive/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Trash2 className={`h-8 w-8 mx-auto mb-2 ${
            isDragOverTrash ? 'text-destructive' : 'text-muted-foreground'
          }`} />
          <p className={`text-sm font-medium ${
            isDragOverTrash ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {isDragOverTrash ? 'Release to delete' : 'Drag tools here to delete'}
          </p>
          {selectedToolIds.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedToolIds.length} selected
            </p>
          )}
        </div>
      </div>
    </div>
  );
};