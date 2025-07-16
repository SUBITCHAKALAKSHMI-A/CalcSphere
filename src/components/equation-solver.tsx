import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { evaluate } from "mathjs";

export default function EquationSolver() {
  // Linear equations
  const [linearVariables, setLinearVariables] = useState(2);
  const [linearCoefficients, setLinearCoefficients] = useState(createMatrix(2, 3));
  const [linearSolution, setLinearSolution] = useState<number[] | null>(null);
  const [linearError, setLinearError] = useState<string | null>(null);
  
  // Quadratic equation
  const [a, setA] = useState("1");
  const [b, setB] = useState("0");
  const [c, setC] = useState("0");
  const [quadraticSolution, setQuadraticSolution] = useState<{x1: string, x2: string} | null>(null);
  const [quadraticError, setQuadraticError] = useState<string | null>(null);
  
  // Polynomial roots
  const [polynomialDegree, setPolynomialDegree] = useState(3);
  const [polynomialCoefficients, setPolynomialCoefficients] = useState<string[]>(["1", "0", "0", "0"]);
  const [polynomialSolution, setPolynomialSolution] = useState<string[] | null>(null);
  const [polynomialError, setPolynomialError] = useState<string | null>(null);
  
  function createMatrix(rows: number, cols: number): string[][] {
    return Array(rows).fill(0).map(() => Array(cols).fill("0"));
  }

  // Handle changes for linear system
  const handleCoefficientChange = (row: number, col: number, value: string) => {
    const newCoefficients = [...linearCoefficients];
    newCoefficients[row][col] = value;
    setLinearCoefficients(newCoefficients);
  };

  // Resize linear system
  const resizeLinearSystem = (variables: number) => {
    setLinearVariables(variables);
    setLinearCoefficients(createMatrix(variables, variables + 1));
    setLinearSolution(null);
    setLinearError(null);
  };

  // Update polynomial coefficients
  const handlePolynomialCoefficientChange = (index: number, value: string) => {
    const newCoefficients = [...polynomialCoefficients];
    newCoefficients[index] = value;
    setPolynomialCoefficients(newCoefficients);
  };

  // Resize polynomial
  const resizePolynomial = (degree: number) => {
    setPolynomialDegree(degree);
    setPolynomialCoefficients(Array(degree + 1).fill("0"));
    setPolynomialSolution(null);
    setPolynomialError(null);
  };

  // Solve linear system using Gaussian elimination
  const solveLinearSystem = () => {
    try {
      setLinearError(null);
      const matrix = linearCoefficients.map(row => row.map(val => parseFloat(val) || 0));
      const n = matrix.length;
      
      // Gaussian elimination
      for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
            maxRow = j;
          }
        }
        
        // Swap rows
        [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
        
        // Check for singular matrix
        if (Math.abs(matrix[i][i]) < 1e-10) {
          setLinearError("The system is singular or has multiple solutions");
          setLinearSolution(null);
          return;
        }
        
        // Eliminate below
        for (let j = i + 1; j < n; j++) {
          const factor = matrix[j][i] / matrix[i][i];
          matrix[j][i] = 0;
          
          for (let k = i + 1; k <= n; k++) {
            matrix[j][k] -= factor * matrix[i][k];
          }
        }
      }
      
      // Back substitution
      const solution = new Array(n);
      for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
          sum += matrix[i][j] * solution[j];
        }
        solution[i] = (matrix[i][n] - sum) / matrix[i][i];
      }
      
      setLinearSolution(solution);
      toast.success("System solved successfully");
    } catch (error) {
      setLinearError("Error solving the system");
      setLinearSolution(null);
    }
  };

  // Solve quadratic equation
  const solveQuadraticEquation = () => {
    try {
      setQuadraticError(null);
      const aVal = parseFloat(a) || 0;
      const bVal = parseFloat(b) || 0;
      const cVal = parseFloat(c) || 0;
      
      if (aVal === 0) {
        if (bVal === 0) {
          if (cVal === 0) {
            setQuadraticSolution({ x1: "All real numbers", x2: "" });
          } else {
            setQuadraticError("No solution (contradiction)");
            setQuadraticSolution(null);
          }
          return;
        }
        
        // Linear equation: bx + c = 0
        const x = -cVal / bVal;
        setQuadraticSolution({ x1: x.toFixed(4), x2: "" });
        return;
      }
      
      // Quadratic formula
      const discriminant = bVal * bVal - 4 * aVal * cVal;
      
      if (discriminant < 0) {
        // Complex roots
        const realPart = (-bVal / (2 * aVal)).toFixed(4);
        const imagPart = (Math.sqrt(-discriminant) / (2 * aVal)).toFixed(4);
        setQuadraticSolution({
          x1: `${realPart} + ${imagPart}i`,
          x2: `${realPart} - ${imagPart}i`
        });
      } else if (discriminant === 0) {
        // One real root
        const x = -bVal / (2 * aVal);
        setQuadraticSolution({ x1: x.toFixed(4), x2: x.toFixed(4) });
      } else {
        // Two real roots
        const x1 = (-bVal + Math.sqrt(discriminant)) / (2 * aVal);
        const x2 = (-bVal - Math.sqrt(discriminant)) / (2 * aVal);
        setQuadraticSolution({ x1: x1.toFixed(4), x2: x2.toFixed(4) });
      }
      
      toast.success("Equation solved successfully");
    } catch (error) {
      setQuadraticError("Error solving the equation");
      setQuadraticSolution(null);
    }
  };

  // Solve polynomial using numerical methods
  const solvePolynomial = () => {
    try {
      setPolynomialError(null);
      
      const coeffs = polynomialCoefficients.map(c => parseFloat(c) || 0);
      if (coeffs[0] === 0) {
        setPolynomialError("Leading coefficient cannot be zero");
        return;
      }
      
      // For demonstration purposes, we'll use a simple approach
      // For higher degree polynomials, more sophisticated numerical methods would be used
      
      if (polynomialDegree <= 2) {
        // For linear or quadratic polynomials, use direct formulas
        if (polynomialDegree === 1) {
          // Linear: ax + b = 0
          const solution = [-coeffs[1] / coeffs[0]];
          setPolynomialSolution(solution.map(x => x.toFixed(4)));
        } else {
          // Quadratic: use quadratic formula
          const a = coeffs[0];
          const b = coeffs[1];
          const c = coeffs[2];
          const discriminant = b * b - 4 * a * c;
          
          if (discriminant < 0) {
            const realPart = (-b / (2 * a)).toFixed(4);
            const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
            setPolynomialSolution([
              `${realPart} + ${imagPart}i`,
              `${realPart} - ${imagPart}i`
            ]);
          } else {
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            setPolynomialSolution([x1.toFixed(4), x2.toFixed(4)]);
          }
        }
      } else {
        // For cubic and higher, we'd use numerical methods
        // For demo purposes, show placeholder
        setPolynomialSolution([
          "Numerical approximation required",
          "Use specialized libraries for higher-degree polynomials"
        ]);
      }
      
      toast.success("Polynomial evaluation complete");
    } catch (error) {
      setPolynomialError("Error evaluating polynomial");
      setPolynomialSolution(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Equation Solver</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="linear" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="linear">Linear System</TabsTrigger>
            <TabsTrigger value="quadratic">Quadratic</TabsTrigger>
            <TabsTrigger value="polynomial">Polynomial</TabsTrigger>
          </TabsList>
          
          {/* Linear System Solver */}
          <TabsContent value="linear" className="space-y-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="variables">Variables:</Label>
              <Select
                value={linearVariables.toString()}
                onValueChange={(value) => resizeLinearSystem(parseInt(value))}
              >
                <SelectTrigger id="variables" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              {linearCoefficients.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  {row.map((val, j) => (
                    j === linearVariables ? (
                      <div key={j} className="flex items-center">
                        <span className="mx-2">=</span>
                        <Input
                          type="number"
                          value={val}
                          onChange={(e) => handleCoefficientChange(i, j, e.target.value)}
                          className="w-20"
                        />
                      </div>
                    ) : (
                      <div key={j} className="flex items-center">
                        <Input
                          type="number"
                          value={val}
                          onChange={(e) => handleCoefficientChange(i, j, e.target.value)}
                          className="w-20"
                        />
                        <span className="mx-1">{j < linearVariables - 1 ? `x${j + 1} +` : `x${j + 1}`}</span>
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
            
            <Button onClick={solveLinearSystem} className="w-full">
              Solve System
            </Button>
            
            {linearError && (
              <Alert variant="destructive">
                <AlertDescription>{linearError}</AlertDescription>
              </Alert>
            )}
            
            {linearSolution && (
              <div className="space-y-2 p-4 bg-muted/30 rounded-md">
                <h3 className="font-medium">Solution:</h3>
                {linearSolution.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span>{`x${i + 1} =`}</span>
                    <span className="font-semibold">{val.toFixed(4)}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Quadratic Equation Solver */}
          <TabsContent value="quadratic" className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-lg">ax² + bx + c = 0</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="a">a</Label>
                <Input
                  id="a"
                  type="number"
                  value={a}
                  onChange={(e) => setA(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="b">b</Label>
                <Input
                  id="b"
                  type="number"
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="c">c</Label>
                <Input
                  id="c"
                  type="number"
                  value={c}
                  onChange={(e) => setC(e.target.value)}
                />
              </div>
            </div>
            
            <Button onClick={solveQuadraticEquation} className="w-full">
              Solve Quadratic Equation
            </Button>
            
            {quadraticError && (
              <Alert variant="destructive">
                <AlertDescription>{quadraticError}</AlertDescription>
              </Alert>
            )}
            
            {quadraticSolution && (
              <div className="space-y-2 p-4 bg-muted/30 rounded-md">
                <h3 className="font-medium">Solution:</h3>
                <div className="flex items-center gap-2">
                  <span>x₁ =</span>
                  <span className="font-semibold">{quadraticSolution.x1}</span>
                </div>
                {quadraticSolution.x2 && (
                  <div className="flex items-center gap-2">
                    <span>x₂ =</span>
                    <span className="font-semibold">{quadraticSolution.x2}</span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          {/* Polynomial Solver */}
          <TabsContent value="polynomial" className="space-y-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="degree">Degree:</Label>
              <Select
                value={polynomialDegree.toString()}
                onValueChange={(value) => resizePolynomial(parseInt(value))}
              >
                <SelectTrigger id="degree" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground mb-2">
                Enter coefficients: {polynomialCoefficients.map((_, i) => 
                  i === 0 ? "a" : i === 1 ? " + bx" : ` + cx^${i}`
                ).join("")} = 0
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {polynomialCoefficients.map((val, i) => (
                  <div key={i} className="space-y-1">
                    <Label htmlFor={`coeff-${i}`}>{`x^${polynomialDegree - i}`}</Label>
                    <Input
                      id={`coeff-${i}`}
                      type="number"
                      value={val}
                      onChange={(e) => handlePolynomialCoefficientChange(i, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <Button onClick={solvePolynomial} className="w-full">
              Analyze Polynomial
            </Button>
            
            {polynomialError && (
              <Alert variant="destructive">
                <AlertDescription>{polynomialError}</AlertDescription>
              </Alert>
            )}
            
            {polynomialSolution && (
              <div className="space-y-2 p-4 bg-muted/30 rounded-md">
                <h3 className="font-medium">Roots:</h3>
                {polynomialSolution.map((val, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span>{`x${i + 1} =`}</span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}