import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface StatsResult {
  count: number;
  sum: number;
  min: number;
  max: number;
  range: number;
  mean: number;
  median: number;
  variance: number;
  stdDev: number;
  mode: number[];
}

export default function StatisticsCalculator() {
  const [dataInput, setDataInput] = useState("");
  const [stats, setStats] = useState<StatsResult | null>(null);

  const calculateStatistics = () => {
    try {
      // Parse input to array of numbers
      const dataStr = dataInput.replace(/\s+/g, ',').replace(/,+/g, ',').trim();
      if (!dataStr) {
        toast.error("Please enter data values");
        return;
      }

      const data = dataStr.split(',')
        .filter(val => val.trim() !== '')
        .map(val => parseFloat(val.trim()))
        .filter(val => !isNaN(val));

      if (data.length === 0) {
        toast.error("No valid numeric data found");
        return;
      }

      // Sort data for calculations
      const sortedData = [...data].sort((a, b) => a - b);
      const count = data.length;
      const sum = data.reduce((acc, val) => acc + val, 0);
      const min = sortedData[0];
      const max = sortedData[count - 1];
      const range = max - min;
      const mean = sum / count;
      
      // Calculate median
      let median: number;
      if (count % 2 === 0) {
        median = (sortedData[count / 2 - 1] + sortedData[count / 2]) / 2;
      } else {
        median = sortedData[Math.floor(count / 2)];
      }

      // Calculate variance
      const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
      const stdDev = Math.sqrt(variance);

      // Calculate mode
      const frequency: { [key: number]: number } = {};
      data.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
      });
      
      let maxFreq = 0;
      let modes: number[] = [];
      
      Object.entries(frequency).forEach(([val, freq]) => {
        const numVal = parseFloat(val);
        if (freq > maxFreq) {
          maxFreq = freq;
          modes = [numVal];
        } else if (freq === maxFreq) {
          modes.push(numVal);
        }
      });

      // If all values appear the same number of times, there's no mode
      if (modes.length === Object.keys(frequency).length) {
        modes = [];
      }

      const result: StatsResult = {
        count,
        sum,
        min,
        max,
        range,
        mean,
        median,
        variance,
        stdDev,
        mode: modes
      };

      setStats(result);
      toast.success("Statistics calculated successfully");
    } catch (error) {
      toast.error("Error calculating statistics");
      setStats(null);
    }
  };

  const formatNumber = (num: number): string => {
    // Format to 4 decimal places, but trim trailing zeros
    return num.toFixed(4).replace(/\.?0+$/, "");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Statistics Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="data-input">Enter data values (comma or space separated)</Label>
            <Textarea
              id="data-input"
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder="e.g., 1, 2, 3, 4, 5"
              rows={4}
            />
          </div>
          
          <Button onClick={calculateStatistics} className="w-full">
            Calculate Statistics
          </Button>
          
          {stats && (
            <div className="bg-muted/30 rounded-md p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Count:</span>
                  <span className="font-semibold">{stats.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sum:</span>
                  <span className="font-semibold">{formatNumber(stats.sum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Minimum:</span>
                  <span className="font-semibold">{formatNumber(stats.min)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Maximum:</span>
                  <span className="font-semibold">{formatNumber(stats.max)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Range:</span>
                  <span className="font-semibold">{formatNumber(stats.range)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mean:</span>
                  <span className="font-semibold">{formatNumber(stats.mean)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Median:</span>
                  <span className="font-semibold">{formatNumber(stats.median)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Variance:</span>
                  <span className="font-semibold">{formatNumber(stats.variance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Standard Deviation:</span>
                  <span className="font-semibold">{formatNumber(stats.stdDev)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mode:</span>
                  <span className="font-semibold">
                    {stats.mode.length > 0
                      ? stats.mode.map(formatNumber).join(", ")
                      : "No mode"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}