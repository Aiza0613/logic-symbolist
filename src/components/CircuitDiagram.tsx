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
  level: number;
}

export const CircuitDiagram = ({ ast, variables }: CircuitDiagramProps) => {
  const GATE_WIDTH = 70;
  const GATE_HEIGHT = 50;
  const LEVEL_SPACING = 180;
  const GATE_SPACING = 100;
  const INPUT_SIZE = 8;

  // Calculate tree depth and positions (reversed for left-to-right flow)
  const calculatePositions = (node: ExpressionNode, level: number = 0, index: number = 0): GatePosition[] => {
    if (!node) return [];
    
    const positions: GatePosition[] = [];
    const id = `${node.value}-${level}-${index}`;
    
    if (node.type === 'variable') {
      positions.push({ x: level * LEVEL_SPACING, y: index * GATE_SPACING, node, id, level });
    } else {
      const leftPositions = node.left ? calculatePositions(node.left, level - 1, index * 2) : [];
      const rightPositions = node.right ? calculatePositions(node.right, level - 1, index * 2 + 1) : [];
      
      const childPositions = [...leftPositions, ...rightPositions];
      const avgY = childPositions.length > 0
        ? childPositions.reduce((sum, p) => sum + p.y, 0) / childPositions.length
        : index * GATE_SPACING;
      
      positions.push({ x: level * LEVEL_SPACING, y: avgY, node, id, level });
      positions.push(...childPositions);
    }
    
    return positions;
  };

  // Get max level depth and reverse positions for left-to-right flow
  const getMaxLevel = (node: ExpressionNode, level: number = 0): number => {
    if (node.type === 'variable') return level;
    const leftLevel = node.left ? getMaxLevel(node.left, level + 1) : level;
    const rightLevel = node.right ? getMaxLevel(node.right, level + 1) : level;
    return Math.max(leftLevel, rightLevel);
  };

  const maxLevel = getMaxLevel(ast);
  const rawPositions = calculatePositions(ast, maxLevel);
  
  // Reverse x positions for left-to-right flow
  const positions = rawPositions.map(p => ({
    ...p,
    x: (maxLevel - p.level) * LEVEL_SPACING
  }));
  
  // Calculate viewBox to fit all elements
  const minX = Math.min(...positions.map(p => p.x)) - 50;
  const maxX = Math.max(...positions.map(p => p.x)) + GATE_WIDTH + 50;
  const minY = Math.min(...positions.map(p => p.y)) - 50;
  const maxY = Math.max(...positions.map(p => p.y)) + GATE_HEIGHT + 50;
  
  const width = maxX - minX;
  const height = maxY - minY;

  // Render proper gate shapes
  const renderAndGate = (x: number, y: number) => {
    const path = `M ${x} ${y} L ${x + GATE_WIDTH * 0.5} ${y} 
                  Q ${x + GATE_WIDTH} ${y} ${x + GATE_WIDTH} ${y + GATE_HEIGHT / 2}
                  Q ${x + GATE_WIDTH} ${y + GATE_HEIGHT} ${x + GATE_WIDTH * 0.5} ${y + GATE_HEIGHT}
                  L ${x} ${y + GATE_HEIGHT} Z`;
    return path;
  };

  const renderOrGate = (x: number, y: number) => {
    const path = `M ${x} ${y} Q ${x + GATE_WIDTH * 0.3} ${y} ${x + GATE_WIDTH * 0.5} ${y}
                  Q ${x + GATE_WIDTH} ${y} ${x + GATE_WIDTH} ${y + GATE_HEIGHT / 2}
                  Q ${x + GATE_WIDTH} ${y + GATE_HEIGHT} ${x + GATE_WIDTH * 0.5} ${y + GATE_HEIGHT}
                  Q ${x + GATE_WIDTH * 0.3} ${y + GATE_HEIGHT} ${x} ${y + GATE_HEIGHT}
                  Q ${x + GATE_WIDTH * 0.15} ${y + GATE_HEIGHT / 2} ${x} ${y} Z`;
    return path;
  };

  const renderNotGate = (x: number, y: number) => {
    const trianglePath = `M ${x} ${y} L ${x} ${y + GATE_HEIGHT} L ${x + GATE_WIDTH * 0.8} ${y + GATE_HEIGHT / 2} Z`;
    const circleX = x + GATE_WIDTH * 0.8 + 6;
    const circleY = y + GATE_HEIGHT / 2;
    return { trianglePath, circleX, circleY };
  };

  const renderGate = (pos: GatePosition) => {
    const { x, y, node, id } = pos;
    
    if (node.type === 'variable') {
      return (
        <g key={id}>
          <circle
            cx={x}
            cy={y + GATE_HEIGHT / 2}
            r={INPUT_SIZE}
            fill="hsl(var(--primary))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <line
            x1={x + INPUT_SIZE}
            y1={y + GATE_HEIGHT / 2}
            x2={x + 30}
            y2={y + GATE_HEIGHT / 2}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <text
            x={x - 15}
            y={y + GATE_HEIGHT / 2}
            textAnchor="end"
            dominantBaseline="middle"
            fill="hsl(var(--foreground))"
            fontSize="16"
            fontWeight="600"
          >
            {node.value}
          </text>
        </g>
      );
    }

    // Render proper gate shapes
    const op = node.value;
    
    if (op === 'NOT') {
      const { trianglePath, circleX, circleY } = renderNotGate(x, y);
      return (
        <g key={id}>
          <path
            d={trianglePath}
            fill="hsl(var(--secondary))"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <circle
            cx={circleX}
            cy={circleY}
            r={6}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        </g>
      );
    }

    let gatePath = '';
    let isNegated = false;
    
    if (op === 'AND') {
      gatePath = renderAndGate(x, y);
    } else if (op === 'OR') {
      gatePath = renderOrGate(x, y);
    } else if (op === 'NAND') {
      gatePath = renderAndGate(x, y);
      isNegated = true;
    } else if (op === 'NOR') {
      gatePath = renderOrGate(x, y);
      isNegated = true;
    } else if (op === 'XOR') {
      gatePath = renderOrGate(x, y);
    }

    return (
      <g key={id}>
        <path
          d={gatePath}
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        {isNegated && (
          <circle
            cx={x + GATE_WIDTH + 6}
            cy={y + GATE_HEIGHT / 2}
            r={6}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        )}
        {op === 'XOR' && (
          <path
            d={`M ${x - 8} ${y} Q ${x + GATE_WIDTH * 0.15} ${y + GATE_HEIGHT / 2} ${x - 8} ${y + GATE_HEIGHT}`}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
        )}
      </g>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    positions.forEach(pos => {
      if (pos.node.type === 'operator') {
        const outputX = pos.x + GATE_WIDTH + (pos.node.value === 'NAND' || pos.node.value === 'NOR' ? 12 : 0);
        const outputY = pos.y + GATE_HEIGHT / 2;

        if (pos.node.left) {
          const leftPos = positions.find(p => p.node === pos.node.left);
          if (leftPos) {
            const startX = leftPos.node.type === 'variable' ? leftPos.x + 30 : leftPos.x + GATE_WIDTH + (leftPos.node.value === 'NAND' || leftPos.node.value === 'NOR' ? 12 : 0);
            const startY = leftPos.y + GATE_HEIGHT / 2;
            connections.push(
              <line
                key={`${pos.id}-left`}
                x1={startX}
                y1={startY}
                x2={pos.x}
                y2={pos.y + GATE_HEIGHT * 0.35}
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
              />
            );
          }
        }
        if (pos.node.right) {
          const rightPos = positions.find(p => p.node === pos.node.right);
          if (rightPos) {
            const startX = rightPos.node.type === 'variable' ? rightPos.x + 30 : rightPos.x + GATE_WIDTH + (rightPos.node.value === 'NAND' || rightPos.node.value === 'NOR' ? 12 : 0);
            const startY = rightPos.y + GATE_HEIGHT / 2;
            connections.push(
              <line
                key={`${pos.id}-right`}
                x1={startX}
                y1={startY}
                x2={pos.x}
                y2={pos.y + GATE_HEIGHT * 0.65}
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
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
