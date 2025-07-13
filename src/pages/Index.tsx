import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MoonIcon, 
  SunIcon, 
  HistoryIcon, 
  SaveIcon, 
  TrashIcon, 
  RotateCcwIcon, 
  Calculator, 
  Settings, 
  BarChart, 
  UserIcon, 
  LogOutIcon,
  FunctionSquareIcon,
  GridIcon,
  LayoutGridIcon,
  LineChartIcon
} from "lucide-react";
import { evaluate } from "mathjs";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { toast } from "sonner";
import { 
  getTimeOfDayGreeting, 
  getRandomMathQuote, 
  getRandomEncouragement 
} from "@/lib/utils";

// Import components
import UnitConverter from "@/components/unit-converter";
import MatrixCalculator from "@/components/matrix-calculator";
import EquationSolver from "@/components/equation-solver";
import StatisticsCalculator from "@/components/statistics-calculator";

// Register Chart.js components
Chart.register(...registerables);

// Type for chart data
interface ChartData {
  labels: number[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    pointRadius: number;
  }[];
}

interface UserData {
  name: string;
  email: string;
  isAuthenticated: boolean;
}

interface IndexProps {
  user: UserData;
  onLogout: () => void;
}

export default function AdvancedCalculator({ user, onLogout }: IndexProps) {
  // State for calculator
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<{ expression: string; result: string; timestamp: Date }[]>([]);
  const [favorites, setFavorites] = useState<{ expression: string; result: string }[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState("standard");
  const [advancedTab, setAdvancedTab] = useState("converter");
  const [graphExpression, setGraphExpression] = useState("x^2");
  const [graphData, setGraphData] = useState<ChartData | null>(null);
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState("");
  const [encouragement, setEncouragement] = useState("");

  // Set theme effect
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Set greeting and quote on component mount
  useEffect(() => {
    setGreeting(getTimeOfDayGreeting());
    setQuote(getRandomMathQuote());
    setEncouragement(getRandomEncouragement());
  }, []);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        calculateResult();
      } else if (e.key === "Escape") {
        clearInput();
      } else if (/[\d+\-*/().^]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        setInput(prev => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input]);

  // Graph data generation
  useEffect(() => {
    if (activeTab === "graph") {
      try {
        const xValues = Array.from({ length: 100 }, (_, i) => -10 + i * 0.2);
        const yValues = xValues.map(x => {
          try {
            return evaluate(graphExpression.replace(/x/g, `(${x})`));
          } catch {
            return null;
          }
        });

        const validPoints = xValues.map((x, i) => ({ x, y: yValues[i] }))
          .filter(point => point.y !== null && isFinite(point.y));

        setGraphData({
          labels: validPoints.map(p => p.x),
          datasets: [
            {
              label: graphExpression,
              data: validPoints.map(p => p.y),
              borderColor: theme === "dark" ? "#60a5fa" : "#3b82f6",
              backgroundColor: "transparent",
              tension: 0.1,
              pointRadius: 0,
            },
          ],
        });
      } catch (error) {
        console.error("Graph error:", error);
      }
    }
  }, [graphExpression, activeTab, theme]);

  const appendToInput = (value: string) => {
    setInput(prev => prev + value);
  };

  const clearInput = () => {
    setInput("");
    setResult("");
  };

  const calculateResult = () => {
    if (!input) return;

    try {
      // Replace common mathematical expressions
      const formattedInput = input
        .replace(/sin\(/g, "sin(")
        .replace(/cos\(/g, "cos(")
        .replace(/tan\(/g, "tan(")
        .replace(/log\(/g, "log10(")
        .replace(/ln\(/g, "log(");

      const calculatedResult = evaluate(formattedInput).toString();
      setResult(calculatedResult);

      // Add to history
      const newEntry = {
        expression: input,
        result: calculatedResult,
        timestamp: new Date()
      };
      
      setHistory(prev => [newEntry, ...prev.slice(0, 49)]);
    } catch (error) {
      toast.error("Invalid expression");
      setResult("Error");
    }
  };

  const calculatePercentage = () => {
    try {
      const value = evaluate(input) / 100;
      setResult(value.toString());
      setInput(value.toString());
    } catch (error) {
      toast.error("Invalid expression for percentage");
    }
  };

  const toggleSign = () => {
    if (!input) return;
    try {
      const value = evaluate(input) * -1;
      setInput(value.toString());
    } catch (error) {
      toast.error("Cannot toggle sign");
    }
  };

  const addToFavorites = () => {
    if (!input || !result) return;
    
    const newFavorite = { expression: input, result };
    const exists = favorites.some(fav => 
      fav.expression === newFavorite.expression && fav.result === newFavorite.result
    );
    
    if (!exists) {
      setFavorites(prev => [newFavorite, ...prev]);
      toast.success("Added to favorites");
    } else {
      toast.info("Already in favorites");
    }
  };

  // Renamed to loadFromHistory to avoid React hook naming pattern
  const loadFromHistory = (item: { expression: string; result: string }) => {
    setInput(item.expression);
    setResult(item.result);
  };

  const clearHistory = () => {
    setHistory([]);
    toast.info("History cleared");
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get appropriate theme class based on active tab
  const getThemeClass = () => {
    if (activeTab === "standard") return "standard-calculator-theme";
    if (activeTab === "scientific") return "scientific-calculator-theme";
    if (activeTab === "graph") return "graph-calculator-theme";
    if (activeTab === "advanced") {
      if (advancedTab === "converter") return "unit-converter-theme";
      if (advancedTab === "matrix") return "matrix-calculator-theme";
      if (advancedTab === "equation") return "equation-calculator-theme";
      if (advancedTab === "statistics") return "statistics-calculator-theme";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-8 math-symbol-bg">
      {/* Mathematical background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1),transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.2),transparent_70%)]" />
        <div className="mathematical-bg"></div>
      </div>

      {/* Header with User info and Theme toggle */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Advanced Scientific Calculator</h1>
            <p className="text-muted-foreground">
              {greeting}, <span className="font-medium">{user.name}</span>! {encouragement}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SunIcon className="h-4 w-4" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
            <MoonIcon className="h-4 w-4" />
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOutIcon className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Quote of the day */}
      <div className="mb-6 p-4 border rounded-lg bg-background/60 backdrop-blur-sm animate-in fade-in">
        <p className="text-sm text-muted-foreground italic">{quote}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="standard">
                <Calculator className="h-4 w-4 mr-2" />
                Standard
              </TabsTrigger>
              <TabsTrigger value="scientific">
                <FunctionSquareIcon className="h-4 w-4 mr-2" />
                Scientific
              </TabsTrigger>
              <TabsTrigger value="graph">
                <LineChartIcon className="h-4 w-4 mr-2" />
                Graph
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <LayoutGridIcon className="h-4 w-4 mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>
            
            <Card className={`shadow-lg ${getThemeClass()}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between">
                  <span>Calculator</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={addToFavorites}
                    disabled={!input || !result || result === "Error"}
                  >
                    <SaveIcon className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabsContent value="standard" className="mt-0">
                  <div className="bg-muted/50 p-3 rounded-md mb-4 h-24 flex flex-col items-end justify-between overflow-hidden backdrop-blur-sm">
                    <div className="text-sm text-muted-foreground w-full text-right truncate">
                      {input || "0"}
                    </div>
                    <div className="text-3xl font-semibold w-full text-right truncate">
                      {result || "0"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    {/* Row 1 */}
                    <Button variant="outline" className="calculator-button" onClick={() => clearInput()}>C</Button>
                    <Button variant="outline" className="calculator-button" onClick={() => setInput(prev => prev.slice(0, -1))}>⌫</Button>
                    <Button variant="outline" className="calculator-button" onClick={calculatePercentage}>%</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("/")}>/</Button>
                    
                    {/* Row 2 */}
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("7")}>7</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("8")}>8</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("9")}>9</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("*")}>×</Button>
                    
                    {/* Row 3 */}
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("4")}>4</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("5")}>5</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("6")}>6</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("-")}>-</Button>
                    
                    {/* Row 4 */}
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("1")}>1</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("2")}>2</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("3")}>3</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("+")}>+</Button>
                    
                    {/* Row 5 */}
                    <Button variant="secondary" className="calculator-button" onClick={toggleSign}>+/-</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("0")}>0</Button>
                    <Button variant="secondary" className="calculator-button" onClick={() => appendToInput(".")}>.</Button>
                    <Button className="calculator-button equals-button" onClick={calculateResult}>=</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="scientific" className="mt-0">
                  <div className="bg-muted/50 p-3 rounded-md mb-4 h-24 flex flex-col items-end justify-between overflow-hidden backdrop-blur-sm">
                    <div className="text-sm text-muted-foreground w-full text-right truncate">
                      {input || "0"}
                    </div>
                    <div className="text-3xl font-semibold w-full text-right truncate">
                      {result || "0"}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {/* Row 1 */}
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("pi")}>π</Button>
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("e")}>e</Button>
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("(")}>(</Button>
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput(")")}>)</Button>
                    <Button variant="destructive" className="calculator-button" onClick={() => clearInput()}>C</Button>
                    
                    {/* Row 2 */}
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("sin(")}>sin</Button>
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("cos(")}>cos</Button>
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("tan(")}>tan</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("^")}>x^y</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("/")}>/</Button>
                    
                    {/* Row 3 */}
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("asin(")}>sin⁻¹</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("7")}>7</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("8")}>8</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("9")}>9</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("*")}>×</Button>
                    
                    {/* Row 4 */}
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("acos(")}>cos⁻¹</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("4")}>4</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("5")}>5</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("6")}>6</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("-")}>-</Button>
                    
                    {/* Row 5 */}
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("atan(")}>tan⁻¹</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("1")}>1</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("2")}>2</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("3")}>3</Button>
                    <Button variant="outline" className="calculator-button operation-button" onClick={() => appendToInput("+")}>+</Button>
                    
                    {/* Row 6 */}
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("sqrt(")}>√</Button>
                    <Button variant="outline" className="calculator-button function-button" onClick={() => appendToInput("log(")}>log</Button>
                    <Button variant="secondary" className="calculator-button number-button" onClick={() => appendToInput("0")}>0</Button>
                    <Button variant="secondary" className="calculator-button" onClick={() => appendToInput(".")}>.</Button>
                    <Button className="calculator-button equals-button" onClick={calculateResult}>=</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="graph" className="mt-0">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="function">Function (use 'x' as variable)</Label>
                        <div className="flex gap-2">
                          <input
                            id="function"
                            value={graphExpression}
                            onChange={(e) => setGraphExpression(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            placeholder="e.g., x^2, sin(x), etc."
                          />
                          <Button onClick={() => setGraphExpression("")} size="sm" variant="outline">
                            <RotateCcwIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-2 bg-background/80 backdrop-blur-sm h-64">
                      {graphData ? (
                        <Line
                          data={graphData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                              x: {
                                grid: {
                                  color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                },
                                ticks: {
                                  color: theme === "dark" ? "#d1d5db" : "#374151",
                                  maxTicksLimit: 10,
                                }
                              },
                              y: {
                                grid: {
                                  color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
                                },
                                ticks: {
                                  color: theme === "dark" ? "#d1d5db" : "#374151",
                                }
                              }
                            },
                            plugins: {
                              legend: {
                                display: true,
                                labels: {
                                  color: theme === "dark" ? "#d1d5db" : "#374151",
                                }
                              },
                              tooltip: {
                                enabled: true,
                              }
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                          Enter a valid function using x as the variable
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="calculator-button function-button" onClick={() => setGraphExpression("x^2")}>y = x²</Button>
                      <Button variant="outline" className="calculator-button function-button" onClick={() => setGraphExpression("sin(x)")}>y = sin(x)</Button>
                      <Button variant="outline" className="calculator-button function-button" onClick={() => setGraphExpression("cos(x)")}>y = cos(x)</Button>
                      <Button variant="outline" className="calculator-button function-button" onClick={() => setGraphExpression("tan(x)")}>y = tan(x)</Button>
                      <Button variant="outline" className="calculator-button function-button" onClick={() => setGraphExpression("x^3")}>y = x³</Button>
                      <Button variant="outline" className="calculator-button function-button" onClick={() => setGraphExpression("sqrt(x)")}>y = √x</Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="mt-0">
                  <Tabs value={advancedTab} onValueChange={setAdvancedTab}>
                    <TabsList className="w-full grid grid-cols-4">
                      <TabsTrigger value="converter">Converter</TabsTrigger>
                      <TabsTrigger value="matrix">Matrix</TabsTrigger>
                      <TabsTrigger value="equation">Equation</TabsTrigger>
                      <TabsTrigger value="statistics">Statistics</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="converter" className="mt-4">
                      <UnitConverter />
                    </TabsContent>
                    
                    <TabsContent value="matrix" className="mt-4">
                      <MatrixCalculator />
                    </TabsContent>
                    
                    <TabsContent value="equation" className="mt-4">
                      <EquationSolver />
                    </TabsContent>
                    
                    <TabsContent value="statistics" className="mt-4">
                      <StatisticsCalculator />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* User Profile Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* History Panel */}
          <Card className="backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="h-4 w-4" />
                  <span>History</span>
                </div>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearHistory}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                {history.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No calculations yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.map((item, index) => (
                      <div 
                        key={index} 
                        className="p-2 hover:bg-accent rounded-md cursor-pointer transition-colors duration-200"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(item.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm truncate">{item.expression}</div>
                        <div className="font-medium truncate">= {item.result}</div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Favorites Panel */}
          <Card className="backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <SaveIcon className="h-4 w-4" />
                <span>Favorites</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                {favorites.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No favorites yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favorites.map((item, index) => (
                      <div 
                        key={index} 
                        className="p-2 hover:bg-accent rounded-md cursor-pointer transition-colors duration-200"
                        onClick={() => loadFromHistory(item)}
                      >
                        <div className="text-sm truncate">{item.expression}</div>
                        <div className="font-medium truncate">= {item.result}</div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}