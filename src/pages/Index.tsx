import { useState } from "react";
import { ExpressionInput } from "@/components/ExpressionInput";
import { TruthTable } from "@/components/TruthTable";
import { SimplificationResult } from "@/components/SimplificationResult";
import { parseExpression, generateTruthTable, simplifyExpression } from "@/lib/booleanLogic";
import { toast } from "sonner";

const Index = () => {
  const [variables, setVariables] = useState<string[]>([]);
  const [truthTable, setTruthTable] = useState<boolean[]>([]);
  const [originalExpression, setOriginalExpression] = useState("");
  const [simplifiedExpression, setSimplifiedExpression] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleExpressionSubmit = (expression: string) => {
    try {
      const parsed = parseExpression(expression);
      
      if (parsed.variables.length === 0) {
        toast.error("No variables found in expression");
        return;
      }

      if (parsed.variables.length > 6) {
        toast.error("Maximum 6 variables supported for optimal performance");
        return;
      }

      const table = generateTruthTable(parsed);
      const simplified = simplifyExpression(parsed, table);

      setVariables(parsed.variables);
      setTruthTable(table);
      setOriginalExpression(expression);
      setSimplifiedExpression(simplified);
      setShowResults(true);
      
      toast.success("Expression evaluated successfully!");
    } catch (error) {
      console.error("Error evaluating expression:", error);
      toast.error("Invalid expression. Please check your syntax.");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--gradient-subtle)] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-3 py-6">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-[var(--gradient-primary)]">
            Logic Circuit Simulator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simplify Boolean expressions using advanced algorithms like Quine-McCluskey
          </p>
        </header>

        {/* Main Content */}
        <div className="space-y-6">
          <ExpressionInput onExpressionSubmit={handleExpressionSubmit} />

          {showResults && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TruthTable variables={variables} results={truthTable} />
                <SimplificationResult
                  original={originalExpression}
                  simplified={simplifiedExpression}
                  method="Quine-McCluskey"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center pt-12 pb-6">
          <p className="text-sm text-muted-foreground">
            Supports up to 6 variables • AND, OR, NOT, XOR, NAND, NOR operations
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
