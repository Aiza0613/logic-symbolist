// Parse and evaluate Boolean expressions

export interface ExpressionNode {
  type: 'variable' | 'operator';
  value: string;
  left?: ExpressionNode;
  right?: ExpressionNode;
}

export interface ParsedExpression {
  variables: string[];
  evaluate: (values: Map<string, boolean>) => boolean;
  ast: ExpressionNode;
}

// Tokenize the expression
function tokenize(expression: string): string[] {
  const tokens: string[] = [];
  const normalized = expression
    .toUpperCase()
    .replace(/\(/g, " ( ")
    .replace(/\)/g, " ) ");
  
  const parts = normalized.split(/\s+/).filter(s => s.length > 0);
  
  for (const part of parts) {
    tokens.push(part);
  }
  
  return tokens;
}

// Convert infix to postfix notation
function infixToPostfix(tokens: string[]): string[] {
  const precedence: Record<string, number> = {
    'NOT': 4,
    'AND': 3,
    'NAND': 3,
    'OR': 2,
    'NOR': 2,
    'XOR': 2
  };
  
  const output: string[] = [];
  const operators: string[] = [];
  
  for (const token of tokens) {
    if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        output.push(operators.pop()!);
      }
      operators.pop(); // Remove '('
    } else if (precedence[token] !== undefined) {
      while (
        operators.length > 0 &&
        operators[operators.length - 1] !== '(' &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        output.push(operators.pop()!);
      }
      operators.push(token);
    } else {
      // Variable
      output.push(token);
    }
  }
  
  while (operators.length > 0) {
    output.push(operators.pop()!);
  }
  
  return output;
}

// Evaluate postfix expression
function evaluatePostfix(postfix: string[], values: Map<string, boolean>): boolean {
  const stack: boolean[] = [];
  
  for (const token of postfix) {
    if (token === 'NOT') {
      const a = stack.pop()!;
      stack.push(!a);
    } else if (token === 'AND') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(a && b);
    } else if (token === 'OR') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(a || b);
    } else if (token === 'XOR') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(a !== b);
    } else if (token === 'NAND') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(!(a && b));
    } else if (token === 'NOR') {
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(!(a || b));
    } else {
      // Variable
      stack.push(values.get(token) || false);
    }
  }
  
  return stack[0];
}

// Build Abstract Syntax Tree from postfix
function buildAST(postfix: string[]): ExpressionNode {
  const stack: ExpressionNode[] = [];
  
  for (const token of postfix) {
    const operators = ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR'];
    
    if (operators.includes(token)) {
      if (token === 'NOT') {
        const operand = stack.pop()!;
        stack.push({
          type: 'operator',
          value: token,
          right: operand
        });
      } else {
        const right = stack.pop()!;
        const left = stack.pop()!;
        stack.push({
          type: 'operator',
          value: token,
          left,
          right
        });
      }
    } else {
      // Variable
      stack.push({ type: 'variable', value: token });
    }
  }
  
  return stack[0];
}

export function parseExpression(expression: string): ParsedExpression {
  const tokens = tokenize(expression);
  const postfix = infixToPostfix(tokens);
  
  // Extract variables
  const variableSet = new Set<string>();
  const operators = ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR', '(', ')'];
  
  for (const token of tokens) {
    if (!operators.includes(token)) {
      variableSet.add(token);
    }
  }
  
  const variables = Array.from(variableSet).sort();
  const ast = buildAST(postfix);
  
  return {
    variables,
    evaluate: (values: Map<string, boolean>) => evaluatePostfix(postfix, values),
    ast
  };
}

// Generate truth table
export function generateTruthTable(parsed: ParsedExpression): boolean[] {
  const { variables, evaluate } = parsed;
  const numRows = Math.pow(2, variables.length);
  const results: boolean[] = [];
  
  for (let i = 0; i < numRows; i++) {
    const values = new Map<string, boolean>();
    
    for (let j = 0; j < variables.length; j++) {
      const bitPosition = variables.length - 1 - j;
      values.set(variables[j], Boolean((i >> bitPosition) & 1));
    }
    
    results.push(evaluate(values));
  }
  
  return results;
}

export interface SimplificationStep {
  title: string;
  description: string;
  data?: string[];
}

export interface SimplificationResult {
  simplified: string;
  steps: SimplificationStep[];
}

// Quine-McCluskey algorithm for simplification
export function simplifyExpression(parsed: ParsedExpression, truthTable: boolean[]): SimplificationResult {
  const { variables } = parsed;
  const numVars = variables.length;
  const steps: SimplificationStep[] = [];
  
  // Get minterms (where output is 1)
  const minterms: number[] = [];
  for (let i = 0; i < truthTable.length; i++) {
    if (truthTable[i]) {
      minterms.push(i);
    }
  }
  
  steps.push({
    title: "Step 1: Identify Minterms",
    description: `Found ${minterms.length} minterms where the output is 1`,
    data: minterms.map(m => `m${m} = ${m.toString(2).padStart(numVars, '0')}`)
  });
  
  if (minterms.length === 0) return { simplified: "0", steps };
  if (minterms.length === truthTable.length) return { simplified: "1", steps };
  
  // Convert to binary representation with tracking of original minterms
  type Implicant = {
    binary: string;
    minterms: Set<number>;
  };
  
  let currentImplicants: Implicant[] = minterms.map(m => ({
    binary: m.toString(2).padStart(numVars, '0'),
    minterms: new Set([m])
  }));
  
  const allPrimeImplicants: Implicant[] = [];
  let iterationCount = 0;
  
  steps.push({
    title: "Step 2: Initial Grouping",
    description: "Group minterms by the number of 1s in their binary representation",
    data: currentImplicants.map(imp => `${imp.binary} (${Array.from(imp.minterms).join(', ')})`)
  });
  
  // Iteratively combine terms until no more combinations possible
  while (currentImplicants.length > 0) {
    iterationCount++;
    // Group by number of 1s
    const groups: Map<number, Implicant[]> = new Map();
    for (const implicant of currentImplicants) {
      const ones = implicant.binary.split('').filter(b => b === '1').length;
      if (!groups.has(ones)) groups.set(ones, []);
      groups.get(ones)!.push(implicant);
    }
    
    const nextImplicants: Implicant[] = [];
    const combined = new Set<string>();
    const combinedMap = new Map<string, Implicant>();
    
    const groupKeys = Array.from(groups.keys()).sort((a, b) => a - b);
    
    // Try to combine adjacent groups
    for (let i = 0; i < groupKeys.length - 1; i++) {
      const group1 = groups.get(groupKeys[i]) || [];
      const group2 = groups.get(groupKeys[i + 1]) || [];
      
      for (const term1 of group1) {
        for (const term2 of group2) {
          if (countDifferences(term1.binary, term2.binary) === 1) {
            const combinedBinary = combinTerms(term1.binary, term2.binary);
            combined.add(term1.binary);
            combined.add(term2.binary);
            
            // Merge minterms from both terms
            if (!combinedMap.has(combinedBinary)) {
              const mergedMinterms = new Set([...term1.minterms, ...term2.minterms]);
              combinedMap.set(combinedBinary, {
                binary: combinedBinary,
                minterms: mergedMinterms
              });
            } else {
              const existing = combinedMap.get(combinedBinary)!;
              term1.minterms.forEach(m => existing.minterms.add(m));
              term2.minterms.forEach(m => existing.minterms.add(m));
            }
          }
        }
      }
    }
    
    // Terms that weren't combined are prime implicants
    for (const implicant of currentImplicants) {
      if (!combined.has(implicant.binary)) {
        // Check if we already have this prime implicant
        const exists = allPrimeImplicants.some(pi => pi.binary === implicant.binary);
        if (!exists) {
          allPrimeImplicants.push(implicant);
        }
      }
    }
    
    // Add newly combined terms for next iteration
    nextImplicants.push(...Array.from(combinedMap.values()));
    
    if (nextImplicants.length > 0) {
      steps.push({
        title: `Step 2.${iterationCount}: Combining Terms`,
        description: `Combined ${combined.size} terms into ${nextImplicants.length} new implicants`,
        data: nextImplicants.map(imp => `${imp.binary} (covers: ${Array.from(imp.minterms).sort((a, b) => a - b).join(', ')})`)
      });
    }
    
    currentImplicants = nextImplicants;
  }
  
  steps.push({
    title: "Step 3: Prime Implicants",
    description: `Found ${allPrimeImplicants.length} prime implicants (terms that cannot be further combined)`,
    data: allPrimeImplicants.map(pi => 
      `${pi.binary} → ${convertImplicantToExpression(pi.binary, variables)} (covers: ${Array.from(pi.minterms).sort((a, b) => a - b).join(', ')})`
    )
  });
  
  // If we have only one prime implicant, return it
  if (allPrimeImplicants.length === 1) {
    const simplified = convertImplicantToExpression(allPrimeImplicants[0].binary, variables);
    steps.push({
      title: "Final Result",
      description: "Only one prime implicant found - this is the minimized expression",
      data: [simplified]
    });
    return { simplified, steps };
  }
  
  // Find essential prime implicants using coverage table
  const essentialPrimeImplicants: Implicant[] = [];
  const coveredMinterms = new Set<number>();
  
  // Find essential prime implicants (those that cover minterms no other implicant covers)
  for (const minterm of minterms) {
    const covering = allPrimeImplicants.filter(pi => pi.minterms.has(minterm));
    if (covering.length === 1) {
      const essential = covering[0];
      if (!essentialPrimeImplicants.includes(essential)) {
        essentialPrimeImplicants.push(essential);
        essential.minterms.forEach(m => coveredMinterms.add(m));
      }
    }
  }
  
  if (essentialPrimeImplicants.length > 0) {
    steps.push({
      title: "Step 4: Essential Prime Implicants",
      description: `Selected ${essentialPrimeImplicants.length} essential prime implicants that uniquely cover certain minterms`,
      data: essentialPrimeImplicants.map(epi => 
        `${epi.binary} → ${convertImplicantToExpression(epi.binary, variables)}`
      )
    });
  }
  
  // Add remaining prime implicants to cover all minterms
  const selectedImplicants = [...essentialPrimeImplicants];
  const remainingMinterms = minterms.filter(m => !coveredMinterms.has(m));
  
  // Greedy selection: pick implicants that cover the most uncovered minterms
  while (remainingMinterms.length > 0) {
    let bestImplicant: Implicant | null = null;
    let maxCoverage = 0;
    
    for (const implicant of allPrimeImplicants) {
      if (selectedImplicants.includes(implicant)) continue;
      
      const coverage = remainingMinterms.filter(m => implicant.minterms.has(m)).length;
      if (coverage > maxCoverage) {
        maxCoverage = coverage;
        bestImplicant = implicant;
      }
    }
    
    if (bestImplicant) {
      selectedImplicants.push(bestImplicant);
      bestImplicant.minterms.forEach(m => {
        const idx = remainingMinterms.indexOf(m);
        if (idx !== -1) remainingMinterms.splice(idx, 1);
      });
    } else {
      break;
    }
  }
  
  if (selectedImplicants.length > essentialPrimeImplicants.length) {
    const additional = selectedImplicants.filter(si => !essentialPrimeImplicants.includes(si));
    steps.push({
      title: "Step 5: Additional Coverage",
      description: `Added ${additional.length} more prime implicants to cover remaining minterms`,
      data: additional.map(api => 
        `${api.binary} → ${convertImplicantToExpression(api.binary, variables)}`
      )
    });
  }
  
  // Convert selected prime implicants to expression
  const terms = selectedImplicants.map(implicant => 
    convertImplicantToExpression(implicant.binary, variables)
  );
  
  const simplified = terms.length === 1 ? terms[0] : terms.join(' OR ');
  
  steps.push({
    title: "Final Result",
    description: "Minimized Boolean expression in Sum of Products (SOP) form",
    data: [simplified]
  });
  
  return { simplified, steps };
}

function convertImplicantToExpression(binary: string, variables: string[]): string {
  const termParts: string[] = [];
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      termParts.push(variables[i]);
    } else if (binary[i] === '0') {
      termParts.push(`NOT ${variables[i]}`);
    }
  }
  if (termParts.length === 0) return "1";
  return termParts.length === 1 ? termParts[0] : `(${termParts.join(' AND ')})`;
}

function countDifferences(term1: string, term2: string): number {
  let count = 0;
  for (let i = 0; i < term1.length; i++) {
    if (term1[i] !== term2[i]) count++;
  }
  return count;
}

function combinTerms(term1: string, term2: string): string {
  let result = '';
  for (let i = 0; i < term1.length; i++) {
    if (term1[i] === term2[i]) {
      result += term1[i];
    } else {
      result += '-';
    }
  }
  return result;
}

