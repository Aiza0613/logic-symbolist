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

// Quine-McCluskey algorithm for simplification
export function simplifyExpression(parsed: ParsedExpression, truthTable: boolean[]): string {
  const { variables } = parsed;
  const numVars = variables.length;
  
  // Get minterms (where output is 1)
  const minterms: number[] = [];
  for (let i = 0; i < truthTable.length; i++) {
    if (truthTable[i]) {
      minterms.push(i);
    }
  }
  
  if (minterms.length === 0) return "0";
  if (minterms.length === truthTable.length) return "1";
  
  // Convert to binary representation
  const binaryMinterms = minterms.map(m => {
    return m.toString(2).padStart(numVars, '0');
  });
  
  // Group by number of 1s
  const groups: Map<number, string[]> = new Map();
  for (const binary of binaryMinterms) {
    const ones = binary.split('').filter(b => b === '1').length;
    if (!groups.has(ones)) groups.set(ones, []);
    groups.get(ones)!.push(binary);
  }
  
  // Combine terms
  let primeImplicants = new Set<string>(binaryMinterms);
  let changed = true;
  
  while (changed) {
    changed = false;
    const newImplicants = new Set<string>();
    const used = new Set<string>();
    
    const groupKeys = Array.from(groups.keys()).sort((a, b) => a - b);
    
    for (let i = 0; i < groupKeys.length - 1; i++) {
      const group1 = groups.get(groupKeys[i]) || [];
      const group2 = groups.get(groupKeys[i + 1]) || [];
      
      for (const term1 of group1) {
        for (const term2 of group2) {
          const diff = countDifferences(term1, term2);
          if (diff === 1) {
            const combined = combinTerms(term1, term2);
            newImplicants.add(combined);
            used.add(term1);
            used.add(term2);
            changed = true;
          }
        }
      }
    }
    
    // Keep unused terms as prime implicants
    for (const [, terms] of groups) {
      for (const term of terms) {
        if (!used.has(term)) {
          primeImplicants.add(term);
        } else {
          primeImplicants.delete(term);
        }
      }
    }
    
    // Add new combined terms
    for (const term of newImplicants) {
      primeImplicants.add(term);
    }
    
    // Regroup for next iteration
    groups.clear();
    for (const term of newImplicants) {
      const ones = term.split('').filter(b => b === '1').length;
      if (!groups.has(ones)) groups.set(ones, []);
      groups.get(ones)!.push(term);
    }
  }
  
  // Convert prime implicants to expression
  const terms: string[] = [];
  for (const implicant of primeImplicants) {
    const termParts: string[] = [];
    for (let i = 0; i < implicant.length; i++) {
      if (implicant[i] === '1') {
        termParts.push(variables[i]);
      } else if (implicant[i] === '0') {
        termParts.push(`NOT ${variables[i]}`);
      }
    }
    if (termParts.length > 0) {
      terms.push(termParts.length === 1 ? termParts[0] : `(${termParts.join(' AND ')})`);
    }
  }
  
  return terms.length === 1 ? terms[0] : terms.join(' OR ');
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

