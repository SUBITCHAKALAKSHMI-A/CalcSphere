type UnitType = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'time' | 'speed' | 'data';

interface Unit {
  name: string;
  symbol: string;
  conversion: number; // relative to the base unit
}

interface UnitCategory {
  name: string;
  baseUnit: string;
  units: Unit[];
}

// All conversions are relative to the first unit in each category
export const unitCategories: Record<UnitType, UnitCategory> = {
  length: {
    name: 'Length',
    baseUnit: 'meter',
    units: [
      { name: 'Meter', symbol: 'm', conversion: 1 },
      { name: 'Kilometer', symbol: 'km', conversion: 0.001 },
      { name: 'Centimeter', symbol: 'cm', conversion: 100 },
      { name: 'Millimeter', symbol: 'mm', conversion: 1000 },
      { name: 'Mile', symbol: 'mi', conversion: 0.000621371 },
      { name: 'Yard', symbol: 'yd', conversion: 1.09361 },
      { name: 'Foot', symbol: 'ft', conversion: 3.28084 },
      { name: 'Inch', symbol: 'in', conversion: 39.3701 },
    ]
  },
  weight: {
    name: 'Weight',
    baseUnit: 'kilogram',
    units: [
      { name: 'Kilogram', symbol: 'kg', conversion: 1 },
      { name: 'Gram', symbol: 'g', conversion: 1000 },
      { name: 'Milligram', symbol: 'mg', conversion: 1000000 },
      { name: 'Pound', symbol: 'lb', conversion: 2.20462 },
      { name: 'Ounce', symbol: 'oz', conversion: 35.274 },
      { name: 'Ton', symbol: 't', conversion: 0.001 },
    ]
  },
  temperature: {
    name: 'Temperature',
    baseUnit: 'celsius',
    units: [
      { name: 'Celsius', symbol: '°C', conversion: 1 },
      { name: 'Fahrenheit', symbol: '°F', conversion: 1 }, // Special conversion
      { name: 'Kelvin', symbol: 'K', conversion: 1 }, // Special conversion
    ]
  },
  area: {
    name: 'Area',
    baseUnit: 'square meter',
    units: [
      { name: 'Square Meter', symbol: 'm²', conversion: 1 },
      { name: 'Square Kilometer', symbol: 'km²', conversion: 0.000001 },
      { name: 'Square Centimeter', symbol: 'cm²', conversion: 10000 },
      { name: 'Square Mile', symbol: 'mi²', conversion: 3.861e-7 },
      { name: 'Square Yard', symbol: 'yd²', conversion: 1.19599 },
      { name: 'Square Foot', symbol: 'ft²', conversion: 10.7639 },
      { name: 'Square Inch', symbol: 'in²', conversion: 1550 },
      { name: 'Acre', symbol: 'ac', conversion: 0.000247105 },
      { name: 'Hectare', symbol: 'ha', conversion: 0.0001 },
    ]
  },
  volume: {
    name: 'Volume',
    baseUnit: 'cubic meter',
    units: [
      { name: 'Cubic Meter', symbol: 'm³', conversion: 1 },
      { name: 'Liter', symbol: 'L', conversion: 1000 },
      { name: 'Milliliter', symbol: 'mL', conversion: 1000000 },
      { name: 'Gallon (US)', symbol: 'gal', conversion: 264.172 },
      { name: 'Quart (US)', symbol: 'qt', conversion: 1056.69 },
      { name: 'Pint (US)', symbol: 'pt', conversion: 2113.38 },
      { name: 'Cup (US)', symbol: 'cup', conversion: 4226.75 },
      { name: 'Fluid Ounce (US)', symbol: 'fl oz', conversion: 33814 },
      { name: 'Cubic Inch', symbol: 'in³', conversion: 61023.7 },
    ]
  },
  time: {
    name: 'Time',
    baseUnit: 'second',
    units: [
      { name: 'Second', symbol: 's', conversion: 1 },
      { name: 'Millisecond', symbol: 'ms', conversion: 1000 },
      { name: 'Minute', symbol: 'min', conversion: 1/60 },
      { name: 'Hour', symbol: 'h', conversion: 1/3600 },
      { name: 'Day', symbol: 'd', conversion: 1/86400 },
      { name: 'Week', symbol: 'wk', conversion: 1/604800 },
      { name: 'Month (avg)', symbol: 'mo', conversion: 1/2628000 },
      { name: 'Year (365 days)', symbol: 'yr', conversion: 1/31536000 },
    ]
  },
  speed: {
    name: 'Speed',
    baseUnit: 'meter per second',
    units: [
      { name: 'Meter per second', symbol: 'm/s', conversion: 1 },
      { name: 'Kilometer per hour', symbol: 'km/h', conversion: 3.6 },
      { name: 'Mile per hour', symbol: 'mph', conversion: 2.23694 },
      { name: 'Foot per second', symbol: 'ft/s', conversion: 3.28084 },
      { name: 'Knot', symbol: 'kn', conversion: 1.94384 },
    ]
  },
  data: {
    name: 'Data',
    baseUnit: 'byte',
    units: [
      { name: 'Byte', symbol: 'B', conversion: 1 },
      { name: 'Kilobyte', symbol: 'KB', conversion: 1/1024 },
      { name: 'Megabyte', symbol: 'MB', conversion: 1/1048576 },
      { name: 'Gigabyte', symbol: 'GB', conversion: 1/1073741824 },
      { name: 'Terabyte', symbol: 'TB', conversion: 1/1099511627776 },
      { name: 'Bit', symbol: 'bit', conversion: 8 },
      { name: 'Kilobit', symbol: 'Kbit', conversion: 8/1024 },
      { name: 'Megabit', symbol: 'Mbit', conversion: 8/1048576 },
      { name: 'Gigabit', symbol: 'Gbit', conversion: 8/1073741824 },
    ]
  }
};

export function convertUnit(value: number, fromUnit: string, toUnit: string, category: UnitType): number {
  const units = unitCategories[category].units;
  
  // Find the units
  const from = units.find(u => u.name === fromUnit || u.symbol === fromUnit);
  const to = units.find(u => u.name === toUnit || u.symbol === toUnit);
  
  if (!from || !to) {
    throw new Error(`Units not found in category ${category}`);
  }
  
  // Special case for temperature
  if (category === 'temperature') {
    // Convert to Celsius first (as the base unit)
    let celsius: number;
    if (from.name === 'Celsius') {
      celsius = value;
    } else if (from.name === 'Fahrenheit') {
      celsius = (value - 32) * 5/9;
    } else if (from.name === 'Kelvin') {
      celsius = value - 273.15;
    } else {
      throw new Error('Unknown temperature unit');
    }
    
    // Convert from Celsius to target unit
    if (to.name === 'Celsius') {
      return celsius;
    } else if (to.name === 'Fahrenheit') {
      return celsius * 9/5 + 32;
    } else if (to.name === 'Kelvin') {
      return celsius + 273.15;
    } else {
      throw new Error('Unknown temperature unit');
    }
  }
  
  // For other units, convert to base unit and then to target unit
  const valueInBaseUnit = value / from.conversion;
  return valueInBaseUnit * to.conversion;
}