import { useState } from "react";
import { ExpressionInput } from "@/components/ExpressionInput";
import { TruthTable } from "@/components/TruthTable";
import { SimplificationResult } from "@/components/SimplificationResult";
import { CircuitDiagram } from "@/components/CircuitDiagram";
import { parseExpression, generateTruthTable, simplifyExpression, type ExpressionNode, type SimplificationStep } from "@/lib/booleanLogic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const Index = () => {
  const [variables, setVariables] = useState<string[]>([]);
  const [truthTable, setTruthTable] = useState<boolean[]>([]);
  const [originalExpression, setOriginalExpression] = useState("");
  const [simplifiedExpression, setSimplifiedExpression] = useState("");
  const [simplificationSteps, setSimplificationSteps] = useState<SimplificationStep[]>([]);
  const [ast, setAst] = useState<ExpressionNode | null>(null);
  const [simplifiedAst, setSimplifiedAst] = useState<ExpressionNode | null>(null);
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
      const result = simplifyExpression(parsed, table);

      // Parse the simplified expression to get its AST
      let simplifiedParsed: ExpressionNode | null = null;
      try {
        const simplifiedParse = parseExpression(result.simplified);
        simplifiedParsed = simplifiedParse.ast;
      } catch {
        // If simplified expression can't be parsed (e.g., "0" or "1"), use null
        simplifiedParsed = null;
      }

      setVariables(parsed.variables);
      setTruthTable(table);
      setOriginalExpression(expression);
      setSimplifiedExpression(result.simplified);
      setSimplificationSteps(result.steps);
      setAst(parsed.ast);
      setSimplifiedAst(simplifiedParsed);
      setShowResults(true);
      
      toast.success("Expression evaluated successfully!");
    } catch (error) {
      console.error("Error evaluating expression:", error);
      toast.error("Invalid expression. Please check your syntax.");
    }
  };

  const handleReset = () => {
    setVariables([]);
    setTruthTable([]);
    setOriginalExpression("");
    setSimplifiedExpression("");
    setSimplificationSteps([]);
    setAst(null);
    setSimplifiedAst(null);
    setShowResults(false);
    toast.success("Reset complete!");
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
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="gap-2 border-primary/30 hover:bg-primary/10"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {ast && (
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-foreground">Original Circuit</h2>
                      <CircuitDiagram ast={ast} variables={variables} />
                    </div>
                  )}
                  {simplifiedAst && (
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-foreground">Simplified Circuit</h2>
                      <CircuitDiagram ast={simplifiedAst} variables={variables} />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TruthTable variables={variables} results={truthTable} />
                  <SimplificationResult
                    original={originalExpression}
                    simplified={simplifiedExpression}
                    method="Quine-McCluskey"
                    steps={simplificationSteps}
                  />
                </div>
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
