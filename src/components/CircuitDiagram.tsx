import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ExpressionNode } from "@/lib/booleanLogic";

interface CircuitDiagramProps {
  ast: ExpressionNode;
  variables: string[];
}

interface GatePosition {
  x: number;
  y: number;
  node: ExpressionNode;
  id: string;
}

export const CircuitDiagram = ({ ast, variables }: CircuitDiagramProps) => {
  const GATE_WIDTH = 80;
  const GATE_HEIGHT = 60;
  const LEVEL_SPACING = 150;
  const GATE_SPACING = 80;

  // Calculate tree depth and positions
  const calculatePositions = (node: ExpressionNode, level: number = 0, index: number = 0): GatePosition[] => {
    if (!node) return [];
    
    const positions: GatePosition[] = [];
    const id = `${node.value}-${level}-${index}`;
    
    if (node.type === 'variable') {
      positions.push({ x: level * LEVEL_SPACING, y: index * GATE_SPACING, node, id });
    } else {
      const leftPositions = node.left ? calculatePositions(node.left, level + 1, index * 2) : [];
      const rightPositions = node.right ? calculatePositions(node.right, level + 1, index * 2 + 1) : [];
      
      const childPositions = [...leftPositions, ...rightPositions];
      const avgY = childPositions.length > 0
        ? childPositions.reduce((sum, p) => sum + p.y, 0) / childPositions.length
        : index * GATE_SPACING;
      
      positions.push({ x: level * LEVEL_SPACING, y: avgY, node, id });
      positions.push(...childPositions);
    }
    
    return positions;
  };

  const positions = calculatePositions(ast);
  
  // Calculate viewBox to fit all elements
  const minX = Math.min(...positions.map(p => p.x)) - 50;
  const maxX = Math.max(...positions.map(p => p.x)) + GATE_WIDTH + 50;
  const minY = Math.min(...positions.map(p => p.y)) - 50;
  const maxY = Math.max(...positions.map(p => p.y)) + GATE_HEIGHT + 50;
  
  const width = maxX - minX;
  const height = maxY - minY;

  const getGateSymbol = (operator: string) => {
    // Operators are already in full form (AND, OR, NOT, etc.)
    return operator;
  };

  const renderGate = (pos: GatePosition) => {
    const { x, y, node, id } = pos;
    
    if (node.type === 'variable') {
      return (
        <g key={id}>
          <circle
            cx={x + GATE_WIDTH / 2}
            cy={y + GATE_HEIGHT / 2}
            r={25}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="2"
            opacity="0.8"
          />
          <text
            x={x + GATE_WIDTH / 2}
            y={y + GATE_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--primary-foreground))"
            fontSize="18"
            fontWeight="bold"
          >
            {node.value}
          </text>
        </g>
      );
    }

    // Operator gate
    const isUnary = node.value === '!';
    return (
      <g key={id}>
        <rect
          x={x}
          y={y}
          width={GATE_WIDTH}
          height={GATE_HEIGHT}
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          rx="8"
        />
        <text
          x={x + GATE_WIDTH / 2}
          y={y + GATE_HEIGHT / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="hsl(var(--foreground))"
          fontSize="14"
          fontWeight="bold"
        >
          {getGateSymbol(node.value)}
        </text>
      </g>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    positions.forEach(pos => {
      if (pos.node.type === 'operator') {
        if (pos.node.left) {
          const leftPos = positions.find(p => p.node === pos.node.left);
          if (leftPos) {
            connections.push(
              <line
                key={`${pos.id}-left`}
                x1={leftPos.x + GATE_WIDTH / 2}
                y1={leftPos.y + GATE_HEIGHT / 2}
                x2={pos.x}
                y2={pos.y + GATE_HEIGHT / 3}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                opacity="0.6"
              />
            );
          }
        }
        if (pos.node.right) {
          const rightPos = positions.find(p => p.node === pos.node.right);
          if (rightPos) {
            connections.push(
              <line
                key={`${pos.id}-right`}
                x1={rightPos.x + GATE_WIDTH / 2}
                y1={rightPos.y + GATE_HEIGHT / 2}
                x2={pos.x}
                y2={pos.y + (2 * GATE_HEIGHT) / 3}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                opacity="0.6"
              />
            );
          }
        }
      }
    });
    
    return connections;
  };

  return (
    <Card className="shadow-[var(--shadow-elegant)] border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl">Circuit Diagram</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-secondary/30 rounded-lg p-4 overflow-auto">
          <svg
            width="100%"
            height="400"
            viewBox={`${minX} ${minY} ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {renderConnections()}
            {positions.map(pos => renderGate(pos))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};
