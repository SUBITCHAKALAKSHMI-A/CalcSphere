import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type Matrix = number[][];

export default function MatrixCalculator() {
  const [operation, setOperation] = useState("add");
  const [rowsA, setRowsA] = useState(2);
  const [colsA, setColsA] = useState(2);
  const [rowsB, setRowsB] = useState(2);
  const [colsB, setColsB] = useState(2);
  const [matrixA, setMatrixA] = useState<Matrix>(createMatrix(2, 2));
  const [matrixB, setMatrixB] = useState<Matrix>(createMatrix(2, 2));
  const [result, setResult] = useState<Matrix | null>(null);
  const [determinant, setDeterminant] = useState<number | null>(null);

  function createMatrix(rows: number, cols: number): Matrix {
    return Array(rows).fill(0).map(() => Array(cols).fill(0));
  }

  const handleMatrixAChange = (row: number, col: number, value: string) => {
    const newMatrix = [...matrixA];
    newMatrix[row][col] = value === "" ? 0 : Number(value);
    setMatrixA(newMatrix);
  };

  const handleMatrixBChange = (row: number, col: number, value: string) => {
    const newMatrix = [...matrixB];
    newMatrix[row][col] = value === "" ? 0 : Number(value);
    setMatrixB(newMatrix);
  };

  const resizeMatrixA = (rows: number, cols: number) => {
    setRowsA(rows);
    setColsA(cols);
    setMatrixA(createMatrix(rows, cols));
  };

  const resizeMatrixB = (rows: number, cols: number) => {
    setRowsB(rows);
    setColsB(cols);
    setMatrixB(createMatrix(rows, cols));
  };

  const validateDimensions = (): boolean => {
    switch (operation) {
      case "add":
      case "subtract":
        if (rowsA !== rowsB || colsA !== colsB) {
          toast.error("Matrices must have the same dimensions for addition/subtraction");
          return false;
        }
        break;
      case "multiply":
        if (colsA !== rowsB) {
          toast.error(`First matrix columns (${colsA}) must equal second matrix rows (${rowsB}) for multiplication`);
          return false;
        }
        break;
      case "determinant":
      case "inverse":
        if (rowsA !== colsA) {
          toast.error("Matrix must be square (same number of rows and columns)");
          return false;
        }
        break;
      case "transpose":
        // No validation needed
        break;
    }
    return true;
  };

  const calculate = () => {
    if (!validateDimensions()) return;

    switch (operation) {
      case "add":
        setResult(addMatrices(matrixA, matrixB));
        setDeterminant(null);
        break;
      case "subtract":
        setResult(subtractMatrices(matrixA, matrixB));
        setDeterminant(null);
        break;
      case "multiply":
        setResult(multiplyMatrices(matrixA, matrixB));
        setDeterminant(null);
        break;
      case "transpose":
        setResult(transposeMatrix(matrixA));
        setDeterminant(null);
        break;
      case "determinant":
        try {
          const det = calculateDeterminant(matrixA);
          setDeterminant(det);
          setResult(null);
        } catch (error) {
          toast.error("Error calculating determinant");
          setDeterminant(null);
        }
        break;
      case "inverse":
        try {
          setResult(inverseMatrix(matrixA));
          setDeterminant(null);
        } catch (error) {
          toast.error("Matrix is not invertible");
          setResult(null);
        }
        break;
    }
  };

  const addMatrices = (a: Matrix, b: Matrix): Matrix => {
    return a.map((row, i) => row.map((val, j) => val + b[i][j]));
  };

  const subtractMatrices = (a: Matrix, b: Matrix): Matrix => {
    return a.map((row, i) => row.map((val, j) => val - b[i][j]));
  };

  const multiplyMatrices = (a: Matrix, b: Matrix): Matrix => {
    const result = createMatrix(a.length, b[0].length);
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < a[0].length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  };

  const transposeMatrix = (matrix: Matrix): Matrix => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = createMatrix(cols, rows);
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j];
      }
    }
    
    return result;
  };

  const calculateDeterminant = (matrix: Matrix): number => {
    const n = matrix.length;
    
    if (n === 1) {
      return matrix[0][0];
    }
    
    if (n === 2) {
      return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }
    
    let det = 0;
    for (let j = 0; j < n; j++) {
      det += Math.pow(-1, j) * matrix[0][j] * calculateDeterminant(getSubmatrix(matrix, 0, j));
    }
    
    return det;
  };

  const getSubmatrix = (matrix: Matrix, row: number, col: number): Matrix => {
    const n = matrix.length;
    const submatrix: Matrix = [];
    
    for (let i = 0; i < n; i++) {
      if (i === row) continue;
      
      const newRow: number[] = [];
      for (let j = 0; j < n; j++) {
        if (j === col) continue;
        newRow.push(matrix[i][j]);
      }
      
      submatrix.push(newRow);
    }
    
    return submatrix;
  };

  const inverseMatrix = (matrix: Matrix): Matrix => {
    const n = matrix.length;
    const det = calculateDeterminant(matrix);
    
    if (Math.abs(det) < 1e-10) {
      throw new Error("Matrix is not invertible");
    }
    
    if (n === 1) {
      return [[1 / matrix[0][0]]];
    }
    
    const adjugate: Matrix = createMatrix(n, n);
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const sign = Math.pow(-1, i + j);
        const minor = getSubmatrix(matrix, j, i); // note the j, i swap for transpose
        adjugate[i][j] = sign * calculateDeterminant(minor);
      }
    }
    
    return adjugate.map(row => row.map(val => val / det));
  };

  const renderMatrix = (matrix: Matrix, onChange?: (row: number, col: number, value: string) => void) => {
    return (
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${matrix[0].length}, minmax(0, 1fr))` }}>
        {matrix.map((row, i) =>
          row.map((cell, j) => (
            <Input
              key={`${i}-${j}`}
              type="number"
              className="w-full h-10 text-center p-1"
              value={cell}
              onChange={onChange ? (e) => onChange(i, j, e.target.value) : undefined}
              readOnly={!onChange}
            />
          ))
        )}
      </div>
    );
  };

  const dimensionOptions = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Matrix Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="matrices" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="matrices">Matrices</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matrices">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Matrix A</Label>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={rowsA.toString()}
                      onValueChange={(value) => resizeMatrixA(parseInt(value), colsA)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Rows" />
                      </SelectTrigger>
                      <SelectContent>
                        {dimensionOptions.map((dim) => (
                          <SelectItem key={`rowA-${dim}`} value={dim.toString()}>
                            {dim}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>×</span>
                    <Select
                      value={colsA.toString()}
                      onValueChange={(value) => resizeMatrixA(rowsA, parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Columns" />
                      </SelectTrigger>
                      <SelectContent>
                        {dimensionOptions.map((dim) => (
                          <SelectItem key={`colA-${dim}`} value={dim.toString()}>
                            {dim}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {renderMatrix(matrixA, handleMatrixAChange)}
              </div>

              <div className={operation === "determinant" || operation === "transpose" || operation === "inverse" ? "hidden" : ""}>
                <div className="flex justify-between items-center mb-2">
                  <Label>Matrix B</Label>
                  <div className="flex gap-2 items-center">
                    <Select
                      value={rowsB.toString()}
                      onValueChange={(value) => resizeMatrixB(parseInt(value), colsB)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Rows" />
                      </SelectTrigger>
                      <SelectContent>
                        {dimensionOptions.map((dim) => (
                          <SelectItem key={`rowB-${dim}`} value={dim.toString()}>
                            {dim}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>×</span>
                    <Select
                      value={colsB.toString()}
                      onValueChange={(value) => resizeMatrixB(rowsB, parseInt(value))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue placeholder="Columns" />
                      </SelectTrigger>
                      <SelectContent>
                        {dimensionOptions.map((dim) => (
                          <SelectItem key={`colB-${dim}`} value={dim.toString()}>
                            {dim}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {renderMatrix(matrixB, handleMatrixBChange)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="operations">
            <div className="space-y-4">
              <div>
                <Label htmlFor="operation">Operation</Label>
                <Select
                  value={operation}
                  onValueChange={setOperation}
                >
                  <SelectTrigger id="operation">
                    <SelectValue placeholder="Select operation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Addition (A + B)</SelectItem>
                    <SelectItem value="subtract">Subtraction (A - B)</SelectItem>
                    <SelectItem value="multiply">Multiplication (A × B)</SelectItem>
                    <SelectItem value="transpose">Transpose (A^T)</SelectItem>
                    <SelectItem value="determinant">Determinant (|A|)</SelectItem>
                    <SelectItem value="inverse">Inverse (A^-1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={calculate} className="w-full">
                Calculate
              </Button>
              
              {result && (
                <div>
                  <Label className="mb-2 block">Result</Label>
                  {renderMatrix(result)}
                </div>
              )}
              
              {determinant !== null && (
                <div className="p-4 bg-muted/30 rounded-md text-center">
                  <Label className="mb-2 block">Determinant</Label>
                  <div className="text-2xl font-bold">{determinant}</div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}