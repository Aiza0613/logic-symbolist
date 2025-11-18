import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { SimplificationStep } from "@/lib/booleanLogic";

interface SimplificationResultProps {
  original: string;
  simplified: string;
  method: string;
  steps?: SimplificationStep[];
}

export const SimplificationResult = ({ original, simplified, method, steps }: SimplificationResultProps) => {
  const [showSteps, setShowSteps] = useState(false);

  return (
    <Card className="shadow-[var(--shadow-elegant)] border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Simplified Expression</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {method}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground font-medium">Original:</div>
          <div className="p-3 bg-secondary/50 rounded-lg font-mono text-sm break-all">
            {original}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground font-medium">Simplified:</div>
          <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg font-mono text-lg font-semibold break-all border border-primary/20">
            {simplified}
          </div>
        </div>

        {steps && steps.length > 0 && (
          <div className="space-y-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowSteps(!showSteps)}
              className="w-full"
            >
              {showSteps ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide Simplification Steps
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  View Simplification Steps
                </>
              )}
            </Button>

            {showSteps && (
              <div className="space-y-4 pt-2">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="p-4 bg-secondary/30 rounded-lg border border-border/50 space-y-2"
                  >
                    <div className="font-semibold text-primary">{step.title}</div>
                    <div className="text-sm text-muted-foreground">{step.description}</div>
                    {step.data && step.data.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {step.data.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-background/50 rounded font-mono text-xs break-all"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
