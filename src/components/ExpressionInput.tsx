import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { toast } from "sonner";

interface ExpressionInputProps {
  onExpressionSubmit: (expression: string) => void;
}

export const ExpressionInput = ({ onExpressionSubmit }: ExpressionInputProps) => {
  const [expression, setExpression] = useState("");

  const handleSubmit = () => {
    if (!expression.trim()) {
      toast.error("Please enter a Boolean expression");
      return;
    }
    onExpressionSubmit(expression.trim());
  };

  const insertOperator = (op: string) => {
    setExpression(prev => prev + (prev && !prev.endsWith(" ") ? " " : "") + op + " ");
  };

  return (
    <Card className="shadow-[var(--shadow-elegant)]">
      <CardHeader>
        <CardTitle className="text-2xl">Boolean Expression</CardTitle>
        <CardDescription>
          Enter your logic expression using variables (A, B, C, etc.) and operators
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g., A AND B OR NOT C"
            className="flex-1 text-lg"
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button onClick={handleSubmit} size="lg" className="bg-[var(--gradient-primary)]">
            Evaluate
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => insertOperator("AND")}>
            AND
          </Button>
          <Button variant="secondary" size="sm" onClick={() => insertOperator("OR")}>
            OR
          </Button>
          <Button variant="secondary" size="sm" onClick={() => insertOperator("NOT")}>
            NOT
          </Button>
          <Button variant="secondary" size="sm" onClick={() => insertOperator("XOR")}>
            XOR
          </Button>
          <Button variant="secondary" size="sm" onClick={() => insertOperator("NAND")}>
            NAND
          </Button>
          <Button variant="secondary" size="sm" onClick={() => insertOperator("NOR")}>
            NOR
          </Button>
          <Button variant="outline" size="sm" onClick={() => setExpression("")}>
            Clear
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-1 bg-secondary/50 p-3 rounded-lg">
          <p><strong>Supported operators:</strong> AND, OR, NOT, XOR, NAND, NOR</p>
          <p><strong>Variables:</strong> Use single letters (A, B, C, etc.)</p>
          <p><strong>Example:</strong> (A AND B) OR (NOT C AND D)</p>
        </div>
      </CardContent>
    </Card>
  );
};
