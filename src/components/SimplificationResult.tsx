import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface SimplificationResultProps {
  original: string;
  simplified: string;
  method: string;
}

export const SimplificationResult = ({ original, simplified, method }: SimplificationResultProps) => {
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
      </CardContent>
    </Card>
  );
};
