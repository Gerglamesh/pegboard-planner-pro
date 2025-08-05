export interface Tool {
  id: string;
  type: 'screwdriver' | 'hammer' | 'pliers';
  name: string;
  shape: number[][]; // 2D array representing occupied grid cells
  rotation: 0 | 90 | 180 | 270; // degrees
  color: string;
  position?: { x: number; y: number }; // Grid position when placed
}

export interface PegboardState {
  tools: Tool[];
  selectedToolIds: string[];
  gridSize: { width: number; height: number };
  cellSize: number;
}

export interface DragState {
  isDragging: boolean;
  draggedTool: Tool | null;
  previewPosition: { x: number; y: number } | null;
}

// Predefined tool templates
export const TOOL_TEMPLATES: Omit<Tool, 'id' | 'position'>[] = [
  {
    type: 'screwdriver',
    name: 'Phillips Screwdriver',
    shape: [[1], [1], [1], [1]], // 4 cells tall, 1 cell wide
    rotation: 0,
    color: '#FF6B35'
  },
  {
    type: 'screwdriver',
    name: 'Flathead Screwdriver',
    shape: [[1], [1], [1], [1]], // 4 cells tall, 1 cell wide
    rotation: 0,
    color: '#FF6B35'
  },
  {
    type: 'hammer',
    name: 'Claw Hammer',
    shape: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0]
    ], // Hammer head + handle
    rotation: 0,
    color: '#8B4513'
  },
  {
    type: 'pliers',
    name: 'Needle Nose Pliers',
    shape: [
      [1, 0],
      [1, 1],
      [0, 1]
    ], // L-shaped
    rotation: 0,
    color: '#4682B4'
  },
  {
    type: 'pliers',
    name: 'Wire Cutters',
    shape: [
      [1, 1],
      [1, 1]
    ], // 2x2 square
    rotation: 0,
    color: '#4682B4'
  }
];