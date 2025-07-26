import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, RefreshCcwIcon } from "lucide-react";
import { unitCategories, convertUnit } from "@/lib/conversion";

export default function UnitConverter() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [inputValue, setInputValue] = useState<string>('1');
  const [result, setResult] = useState<string>('');
  const [formula, setFormula] = useState<string>('');

  // Set initial units when category changes
  useEffect(() => {
    if (unitCategories[category as keyof typeof unitCategories]) {
      const units = unitCategories[category as keyof typeof unitCategories].units;
      setFromUnit(units[0].name);
      setToUnit(units.length > 1 ? units[1].name : units[0].name);
    }
  }, [category]);

  // Calculate conversion when any input changes
  useEffect(() => {
    if (fromUnit && toUnit && inputValue) {
      try {
        const value = parseFloat(inputValue);
        if (!isNaN(value)) {
          const converted = convertUnit(
            value,
            fromUnit,
            toUnit,
            category as keyof typeof unitCategories
          );
          
          setResult(converted.toLocaleString(undefined, {
            maximumFractionDigits: 10,
            minimumFractionDigits: 0
          }));
          
          // Generate formula explanation
          generateFormula(value, fromUnit, toUnit, category as keyof typeof unitCategories, converted);
        } else {
          setResult('');
          setFormula('');
        }
      } catch (error) {
        setResult('Error');
        setFormula('');
      }
    }
  }, [category, fromUnit, toUnit, inputValue]);

  const generateFormula = (
    value: number,
    from: string,
    to: string,
    cat: keyof typeof unitCategories,
    result: number
  ) => {
    const units = unitCategories[cat].units;
    const fromUnit = units.find(u => u.name === from);
    const toUnit = units.find(u => u.name === to);
    
    if (!fromUnit || !toUnit) return;
    
    if (cat === 'temperature') {
      if (from === 'Celsius' && to === 'Fahrenheit') {
        setFormula(`${value}°C × (9/5) + 32 = ${result}°F`);
      } else if (from === 'Fahrenheit' && to === 'Celsius') {
        setFormula(`(${value}°F - 32) × (5/9) = ${result}°C`);
      } else if (from === 'Celsius' && to === 'Kelvin') {
        setFormula(`${value}°C + 273.15 = ${result}K`);
      } else if (from === 'Kelvin' && to === 'Celsius') {
        setFormula(`${value}K - 273.15 = ${result}°C`);
      } else if (from === 'Fahrenheit' && to === 'Kelvin') {
        setFormula(`(${value}°F - 32) × (5/9) + 273.15 = ${result}K`);
      } else if (from === 'Kelvin' && to === 'Fahrenheit') {
        setFormula(`(${value}K - 273.15) × (9/5) + 32 = ${result}°F`);
      }
    } else {
      const fromSymbol = fromUnit.symbol;
      const toSymbol = toUnit.symbol;
      setFormula(`${value} ${fromSymbol} = ${result} ${toSymbol}`);
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(unitCategories).map(([key, cat]) => (
                  <SelectItem key={key} value={key}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-11 gap-2 items-end">
            <div className="md:col-span-5">
              <Label htmlFor="fromValue">Value</Label>
              <Input
                id="fromValue"
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>
            
            <div className="hidden md:flex md:col-span-1 justify-center items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={swapUnits}
                className="mt-6"
              >
                <RefreshCcwIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="md:col-span-5">
              <Label htmlFor="result">Result</Label>
              <Input
                id="result"
                value={result}
                readOnly
                className="bg-muted/50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-11 gap-2">
            <div className="md:col-span-5">
              <Label htmlFor="fromUnit">From</Label>
              <Select
                value={fromUnit}
                onValueChange={setFromUnit}
              >
                <SelectTrigger id="fromUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {category && unitCategories[category as keyof typeof unitCategories]?.units.map((unit) => (
                    <SelectItem key={unit.name} value={unit.name}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="hidden md:flex md:col-span-1 justify-center items-center">
              <ArrowRightIcon className="h-4 w-4" />
            </div>
            
            <div className="md:col-span-5">
              <Label htmlFor="toUnit">To</Label>
              <Select
                value={toUnit}
                onValueChange={setToUnit}
              >
                <SelectTrigger id="toUnit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {category && unitCategories[category as keyof typeof unitCategories]?.units.map((unit) => (
                    <SelectItem key={unit.name} value={unit.name}>
                      {unit.name} ({unit.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {formula && (
            <div className="p-2 bg-muted/30 rounded-md text-sm text-muted-foreground">
              {formula}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}