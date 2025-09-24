import React, { useState, useRef, useEffect } from 'react';
import { playButtonClickSound } from '../../utils/audio';
import { allElements } from '../../data/elements';

interface CalculatorProps {
  isVisible: boolean;
  onClose: () => void;
}

interface HistoryEntry {
  id: number;
  operation: string;
  result: string;
  timestamp: Date;
}

const Calculator: React.FC<CalculatorProps> = ({ isVisible, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [significantFigures, setSignificantFigures] = useState(3);
  const [showHistory, setShowHistory] = useState(false);
  const [showChemistry, setShowChemistry] = useState(false);
  const [showAcademic, setShowAcademic] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChemTab, setActiveChemTab] = useState<'mol' | 'dilution' | 'gas' | 'convert' | 'formula'>('mol');
  const [activeAcademicTab, setActiveAcademicTab] = useState<'stoichiometry' | 'ph' | 'thermodynamics' | 'kinetics' | 'electrochemistry' | 'spectroscopy' | 'colligative'>('stoichiometry');
  
  // Chemistry calculation states
  const [molInputs, setMolInputs] = useState({ mass: '', molarMass: '', massUnit: 'g' });
  const [molarityInputs, setMolarityInputs] = useState({ mol: '', volume: '', volumeUnit: 'L' });
  const [dilutionInputs, setDilutionInputs] = useState({ c1: '', v1: '', c2: '', v2: '', v1Unit: 'mL', v2Unit: 'mL' });
  const [gasInputs, setGasInputs] = useState({ pressure: '', volume: '', temp: '', moles: '', pressureUnit: 'atm', volumeUnit: 'L', tempUnit: 'K', rConstant: '0.082057' });
  const [formulaInput, setFormulaInput] = useState('');
  const [molarMassResult, setMolarMassResult] = useState<number | null>(null);
  
  // Academic calculation states
  const [stoichiometryInputs, setStoichiometryInputs] = useState({ 
    mass: '', molarMass: '', actualYield: '', theoreticalYield: '', massUnit: 'g' 
  });
  const [phInputs, setPhInputs] = useState({ 
    concentration: '', ka: '', pkKa: '', bufferBase: '', bufferAcid: '', 
    temp: '298', ionicProduct: '', ksp: '', pressure: '', molarityOsmotic: ''
  });
  const [thermoInputs, setThermoInputs] = useState({ 
    enthalpy: '', entropy: '', temp: '298', gibbs: '', equilibriumK: '', 
    electrons: '', cellPotential: '', k1: '', k2: '', t1: '300', t2: '350'
  });
  const [kineticsInputs, setKineticsInputs] = useState({ 
    rateConstant: '', halfLife: '', activationEnergy: '', frequency: '', 
    temp: '298', t1: '298', t2: '308', k1: '', k2: ''
  });
  const [electroInputs, setElectroInputs] = useState({ 
    standardPotential: '', electrons: '', reactionQuotient: '', current: '', 
    time: '', molarMass: '', cellPotential: '', gibbs: ''
  });
  const [spectroInputs, setSpectroInputs] = useState({ 
    absorbance: '', extinction: '', concentration: '', pathLength: '1'
  });
  const [colligativeInputs, setColligativeInputs] = useState({ 
    molality: '', kf: '1.86', kb: '0.52', ionizationFactor: '1', 
    moles: '', solventMoles: '', vaporPressure: '', temp: '298'
  });
  
  // Dragging functionality
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Format number with significant figures
  const formatWithSigFigs = (num: number): string => {
    if (num === 0) return '0';
    
    // Handle very large or very small numbers with scientific notation
    if (Math.abs(num) >= 1e6 || (Math.abs(num) < 1e-3 && Math.abs(num) > 0)) {
      return num.toExponential(significantFigures - 1);
    }
    
    const str = num.toPrecision(significantFigures);
    return parseFloat(str).toString();
  };

  // Temperature conversion helper
  const convertTemperature = (temp: number, fromUnit: string): { tempK: number, message?: string } => {
    if (fromUnit === 'C') {
      const tempK = temp + 273.15;
      return { 
        tempK, 
        message: `Not: ${temp}°C = ${formatWithSigFigs(tempK)} K dönüşümü yapıldı` 
      };
    }
    return { tempK: temp };
  };

  // Add to history
  const addToHistory = (operation: string, result: string) => {
    const newEntry: HistoryEntry = {
      id: Date.now(),
      operation,
      result,
      timestamp: new Date()
    };
    setHistory(prev => [newEntry, ...prev.slice(0, 19)]); // Keep last 20
  };

  // Parse chemical formula for molar mass
  const parseFormula = (formula: string): number => {
    try {
      // Remove hydration notation (·nH2O) for now - simplified parser
      const cleanFormula = formula.replace(/·\d*H2O/g, '');
      let totalMass = 0;
      
      // Simple regex to match element symbols and numbers
      const matches = cleanFormula.match(/([A-Z][a-z]?)(\d*)/g) || [];
      
      for (const match of matches) {
        const elementMatch = match.match(/([A-Z][a-z]?)(\d*)/);
        if (elementMatch) {
          const symbol = elementMatch[1];
          const count = parseInt(elementMatch[2] || '1');
          
          const element = allElements.find(el => el.symbol === symbol);
          if (element) {
            totalMass += element.mass * count;
          }
        }
      }
      
      // Handle hydration if present
      const hydrationMatch = formula.match(/·(\d*)H2O/);
      if (hydrationMatch) {
        const waterCount = parseInt(hydrationMatch[1] || '1');
        const hydrogen = allElements.find(el => el.symbol === 'H')?.mass || 1.008;
        const oxygen = allElements.find(el => el.symbol === 'O')?.mass || 15.999;
        totalMass += waterCount * (2 * hydrogen + oxygen);
      }
      
      return totalMass;
    } catch (error) {
      return 0;
    }
  };

  // Chemistry calculations
  const calculateMol = () => {
    const mass = parseFloat(molInputs.mass);
    const molarMass = parseFloat(molInputs.molarMass);
    
    if (isNaN(mass) || isNaN(molarMass) || molarMass === 0) {
      setDisplay('Error: Invalid input');
      return;
    }
    
    let massInGrams = mass;
    if (molInputs.massUnit === 'mg') massInGrams = mass / 1000;
    if (molInputs.massUnit === 'kg') massInGrams = mass * 1000;
    
    const result = massInGrams / molarMass;
    const formattedResult = formatWithSigFigs(result);
    setDisplay(`${formattedResult} mol`);
    addToHistory(`${mass} ${molInputs.massUnit} ÷ ${molarMass} g/mol`, `${formattedResult} mol`);
  };

  const calculateMolarity = () => {
    const mol = parseFloat(molarityInputs.mol);
    const volume = parseFloat(molarityInputs.volume);
    
    if (isNaN(mol) || isNaN(volume) || volume === 0) {
      setDisplay('Error: Invalid input');
      return;
    }
    
    let volumeInL = volume;
    if (molarityInputs.volumeUnit === 'mL') volumeInL = volume / 1000;
    
    const result = mol / volumeInL;
    const formattedResult = formatWithSigFigs(result);
    setDisplay(`${formattedResult} M`);
    addToHistory(`${mol} mol ÷ ${volume} ${molarityInputs.volumeUnit}`, `${formattedResult} M`);
  };

  const calculateDilution = () => {
    const c1 = parseFloat(dilutionInputs.c1);
    const v1 = parseFloat(dilutionInputs.v1);
    const c2 = parseFloat(dilutionInputs.c2);
    const v2 = parseFloat(dilutionInputs.v2);
    
    // C1V1 = C2V2 - solve for the missing variable
    let result, resultLabel, operation;
    
    if (isNaN(v1) && !isNaN(c1) && !isNaN(c2) && !isNaN(v2)) {
      // Solve for V1
      result = (c2 * v2) / c1;
      resultLabel = `V₁ = ${formatWithSigFigs(result)} ${dilutionInputs.v1Unit}`;
      operation = `C₁V₁ = C₂V₂ → V₁ = (${c2}×${v2})÷${c1}`;
    } else if (isNaN(v2) && !isNaN(c1) && !isNaN(v1) && !isNaN(c2)) {
      // Solve for V2
      result = (c1 * v1) / c2;
      resultLabel = `V₂ = ${formatWithSigFigs(result)} ${dilutionInputs.v2Unit}`;
      operation = `C₁V₁ = C₂V₂ → V₂ = (${c1}×${v1})÷${c2}`;
    } else if (isNaN(c2) && !isNaN(c1) && !isNaN(v1) && !isNaN(v2)) {
      // Solve for C2
      result = (c1 * v1) / v2;
      resultLabel = `C₂ = ${formatWithSigFigs(result)} M`;
      operation = `C₁V₁ = C₂V₂ → C₂ = (${c1}×${v1})÷${v2}`;
    } else {
      setDisplay('Error: Enter 3 of 4 values');
      return;
    }
    
    setDisplay(resultLabel);
    addToHistory(operation, resultLabel);
  };

  const calculateGas = () => {
    const p = parseFloat(gasInputs.pressure);
    const v = parseFloat(gasInputs.volume);
    const t = parseFloat(gasInputs.temp);
    const n = parseFloat(gasInputs.moles);
    const r = parseFloat(gasInputs.rConstant);
    
    // Convert temperature to Kelvin if needed
    const tempConversion = convertTemperature(t, gasInputs.tempUnit);
    const tempK = tempConversion.tempK;
    
    if (tempConversion.message && gasInputs.tempUnit === 'C') {
      setDisplay(tempConversion.message);
      setTimeout(() => {
        calculateGas(); // Recalculate with converted temp
      }, 2000);
      return;
    }
    
    // PV = nRT - solve for missing variable
    let result, resultLabel, operation;
    
    if (isNaN(n) && !isNaN(p) && !isNaN(v) && !isNaN(tempK)) {
      // Solve for n
      result = (p * v) / (r * tempK);
      resultLabel = `n = ${formatWithSigFigs(result)} mol`;
      operation = `PV = nRT → n = PV÷RT`;
    } else if (isNaN(p) && !isNaN(v) && !isNaN(n) && !isNaN(tempK)) {
      // Solve for P
      result = (n * r * tempK) / v;
      resultLabel = `P = ${formatWithSigFigs(result)} ${gasInputs.pressureUnit}`;
      operation = `PV = nRT → P = nRT÷V`;
    } else if (isNaN(v) && !isNaN(p) && !isNaN(n) && !isNaN(tempK)) {
      // Solve for V
      result = (n * r * tempK) / p;
      resultLabel = `V = ${formatWithSigFigs(result)} ${gasInputs.volumeUnit}`;
      operation = `PV = nRT → V = nRT÷P`;
    } else if (isNaN(tempK) && !isNaN(p) && !isNaN(v) && !isNaN(n)) {
      // Solve for T
      result = (p * v) / (n * r);
      resultLabel = `T = ${formatWithSigFigs(result)} K`;
      operation = `PV = nRT → T = PV÷nR`;
    } else {
      setDisplay('Error: Enter 3 of 4 variables');
      return;
    }
    
    setDisplay(resultLabel);
    addToHistory(operation, resultLabel);
  };

  const calculateFormulaWeight = () => {
    if (!formulaInput.trim()) {
      setDisplay('Error: Enter formula');
      return;
    }
    
    const result = parseFormula(formulaInput);
    if (result === 0) {
      setDisplay('Error: Invalid formula');
      return;
    }
    
    const formattedResult = formatWithSigFigs(result);
    setMolarMassResult(result);
    setDisplay(`${formattedResult} g/mol`);
    addToHistory(`Molar mass of ${formulaInput}`, `${formattedResult} g/mol`);
  };

  // Academic Calculations
  const calculateStoichiometry = () => {
    const mass = parseFloat(stoichiometryInputs.mass);
    const molarMass = parseFloat(stoichiometryInputs.molarMass);
    const actualYield = parseFloat(stoichiometryInputs.actualYield);
    const theoreticalYield = parseFloat(stoichiometryInputs.theoreticalYield);
    
    if (!isNaN(mass) && !isNaN(molarMass)) {
      let massInGrams = mass;
      if (stoichiometryInputs.massUnit === 'mg') massInGrams = mass / 1000;
      if (stoichiometryInputs.massUnit === 'kg') massInGrams = mass * 1000;
      
      const moles = massInGrams / molarMass;
      const result = formatWithSigFigs(moles);
      setDisplay(`Mol = ${result} mol`);
      addToHistory(`${mass} ${stoichiometryInputs.massUnit} ÷ ${molarMass} g/mol`, `${result} mol`);
    } else if (!isNaN(actualYield) && !isNaN(theoreticalYield) && theoreticalYield !== 0) {
      const yieldPercent = (actualYield / theoreticalYield) * 100;
      const result = formatWithSigFigs(yieldPercent);
      setDisplay(`% Verim = ${result}%`);
      addToHistory(`(${actualYield} / ${theoreticalYield}) × 100`, `${result}%`);
    } else {
      setDisplay('Hata: Geçerli değerler girin');
    }
  };

  const calculatePH = () => {
    const concentration = parseFloat(phInputs.concentration);
    const ka = parseFloat(phInputs.ka);
    const pkKa = parseFloat(phInputs.pkKa);
    const bufferBase = parseFloat(phInputs.bufferBase);
    const bufferAcid = parseFloat(phInputs.bufferAcid);
    const ksp = parseFloat(phInputs.ksp);
    const molarityOsmotic = parseFloat(phInputs.molarityOsmotic);
    const temp = parseFloat(phInputs.temp);
    
    if (!isNaN(concentration) && concentration > 0) {
      // Strong acid pH calculation
      const ph = -Math.log10(concentration);
      const result = formatWithSigFigs(ph);
      setDisplay(`pH = ${result}`);
      addToHistory(`pH = -log[H⁺] = -log(${concentration})`, `pH = ${result}`);
    } else if (!isNaN(ka) && !isNaN(concentration) && ka > 0 && concentration > 0) {
      // Weak acid pH calculation
      const hConcentration = Math.sqrt(ka * concentration);
      const ph = -Math.log10(hConcentration);
      const result = formatWithSigFigs(ph);
      setDisplay(`pH = ${result}`);
      addToHistory(`[H⁺] = √(Ka·C) → pH = ${result}`, `pH = ${result}`);
    } else if (!isNaN(pkKa) && !isNaN(bufferBase) && !isNaN(bufferAcid) && bufferAcid > 0) {
      // Henderson-Hasselbalch equation
      const ph = pkKa + Math.log10(bufferBase / bufferAcid);
      const result = formatWithSigFigs(ph);
      setDisplay(`pH = ${result}`);
      addToHistory(`pH = pKa + log([A⁻]/[HA])`, `pH = ${result}`);
    } else if (!isNaN(ksp) && ksp > 0) {
      // Solubility calculation for 1:1 salt
      const solubility = Math.sqrt(ksp);
      const result = formatWithSigFigs(solubility);
      setDisplay(`[Ag⁺] = ${result} M`);
      addToHistory(`s = √(Ksp) = √(${ksp})`, `${result} M`);
    } else if (!isNaN(molarityOsmotic) && !isNaN(temp) && temp > 0) {
      // Osmotic pressure
      const R = 0.08206; // L·atm/(mol·K)
      const pressure = molarityOsmotic * R * temp;
      const result = formatWithSigFigs(pressure);
      setDisplay(`π = ${result} atm`);
      addToHistory(`π = M·R·T = ${molarityOsmotic}×${R}×${temp}`, `${result} atm`);
    } else {
      setDisplay('Hata: Geçerli değerler girin');
    }
  };

  const calculateThermodynamics = () => {
    const enthalpy = parseFloat(thermoInputs.enthalpy);
    const entropy = parseFloat(thermoInputs.entropy);
    const temp = parseFloat(thermoInputs.temp);
    const gibbs = parseFloat(thermoInputs.gibbs);
    const k1 = parseFloat(thermoInputs.k1);
    const t1 = parseFloat(thermoInputs.t1);
    const t2 = parseFloat(thermoInputs.t2);
    
    if (!isNaN(enthalpy) && !isNaN(entropy) && !isNaN(temp)) {
      // ΔG = ΔH - TΔS
      const deltaG = enthalpy - (temp * entropy / 1000); // Convert entropy from J to kJ
      const result = formatWithSigFigs(deltaG);
      setDisplay(`ΔG = ${result} kJ/mol`);
      addToHistory(`ΔG = ΔH - TΔS = ${enthalpy} - ${temp}×${entropy/1000}`, `${result} kJ/mol`);
    } else if (!isNaN(gibbs) && !isNaN(temp) && temp > 0) {
      // ΔG° = -RT ln K
      const R = 8.314e-3; // kJ/(mol·K)
      const K = Math.exp(-gibbs / (R * temp));
      const result = formatWithSigFigs(K);
      setDisplay(`K = ${result}`);
      addToHistory(`K = e^(-ΔG°/RT)`, `K = ${result}`);
    } else if (!isNaN(enthalpy) && !isNaN(k1) && !isNaN(t1) && !isNaN(t2) && t1 > 0 && t2 > 0) {
      // Van't Hoff equation
      const R = 8.314e-3; // kJ/(mol·K)
      const lnK2K1 = (-enthalpy / R) * (1/t2 - 1/t1);
      const k2Calc = k1 * Math.exp(lnK2K1);
      const result = formatWithSigFigs(k2Calc);
      setDisplay(`K₂ = ${result}`);
      addToHistory(`ln(K₂/K₁) = -ΔH°/R × (1/T₂ - 1/T₁)`, `K₂ = ${result}`);
    } else {
      setDisplay('Hata: Geçerli değerler girin');
    }
  };

  const calculateKinetics = () => {
    const rateConstant = parseFloat(kineticsInputs.rateConstant);
    const activationEnergy = parseFloat(kineticsInputs.activationEnergy);
    const frequency = parseFloat(kineticsInputs.frequency);
    const temp = parseFloat(kineticsInputs.temp);
    const k1 = parseFloat(kineticsInputs.k1);
    const t1 = parseFloat(kineticsInputs.t1);
    const t2 = parseFloat(kineticsInputs.t2);
    
    if (!isNaN(rateConstant) && rateConstant > 0) {
      // First-order half-life
      const halfLife = 0.693 / rateConstant;
      const result = formatWithSigFigs(halfLife);
      setDisplay(`t½ = ${result} s`);
      addToHistory(`t½ = 0.693/k = 0.693/${rateConstant}`, `${result} s`);
    } else if (!isNaN(activationEnergy) && !isNaN(frequency) && !isNaN(temp) && temp > 0) {
      // Arrhenius equation
      const R = 8.314e-3; // kJ/(mol·K)
      const k = frequency * Math.exp(-activationEnergy / (R * temp));
      const result = formatWithSigFigs(k);
      setDisplay(`k = ${result} s⁻¹`);
      addToHistory(`k = A·e^(-Ea/RT)`, `k = ${result} s⁻¹`);
    } else if (!isNaN(activationEnergy) && !isNaN(k1) && !isNaN(t1) && !isNaN(t2) && t1 > 0 && t2 > 0) {
      // Temperature dependence of rate constant
      const R = 8.314e-3; // kJ/(mol·K)
      const lnk2k1 = (activationEnergy / R) * (1/t1 - 1/t2);
      const k2k1Ratio = Math.exp(lnk2k1);
      const result = formatWithSigFigs(k2k1Ratio);
      setDisplay(`k₂/k₁ = ${result}`);
      addToHistory(`ln(k₂/k₁) = Ea/R × (1/T₁ - 1/T₂)`, `k₂/k₁ = ${result}`);
    } else {
      setDisplay('Hata: Geçerli değerler girin');
    }
  };

  const calculateElectrochemistry = () => {
    const standardPotential = parseFloat(electroInputs.standardPotential);
    const electrons = parseFloat(electroInputs.electrons);
    const reactionQuotient = parseFloat(electroInputs.reactionQuotient);
    const current = parseFloat(electroInputs.current);
    const time = parseFloat(electroInputs.time);
    const molarMass = parseFloat(electroInputs.molarMass);
    
    if (!isNaN(standardPotential) && !isNaN(electrons) && !isNaN(reactionQuotient) && electrons > 0) {
      // Nernst equation
      const cellPotential = standardPotential - (0.05916 / electrons) * Math.log10(reactionQuotient);
      const result = formatWithSigFigs(cellPotential);
      setDisplay(`E = ${result} V`);
      addToHistory(`E = E° - (0.05916/n) log Q`, `E = ${result} V`);
    } else if (!isNaN(standardPotential) && !isNaN(electrons) && electrons > 0) {
      // ΔG° = -nFE°
      const F = 96485; // C/mol
      const deltaG = -electrons * F * standardPotential / 1000; // Convert to kJ/mol
      const result = formatWithSigFigs(deltaG);
      setDisplay(`ΔG° = ${result} kJ/mol`);
      addToHistory(`ΔG° = -nFE°`, `ΔG° = ${result} kJ/mol`);
    } else if (!isNaN(current) && !isNaN(time) && !isNaN(molarMass) && !isNaN(electrons) && electrons > 0) {
      // Faraday's law of electrolysis
      const F = 96485; // C/mol
      const mass = (current * time * molarMass) / (electrons * F);
      const result = formatWithSigFigs(mass);
      setDisplay(`m = ${result} g`);
      addToHistory(`m = (I·t·M)/(n·F)`, `m = ${result} g`);
    } else {
      setDisplay('Hata: Geçerli değerler girin');
    }
  };

  const calculateSpectroscopy = () => {
    const absorbance = parseFloat(spectroInputs.absorbance);
    const extinction = parseFloat(spectroInputs.extinction);
    const concentration = parseFloat(spectroInputs.concentration);
    const pathLength = parseFloat(spectroInputs.pathLength);
    
    if (!isNaN(extinction) && !isNaN(pathLength) && !isNaN(absorbance) && extinction > 0 && pathLength > 0) {
      // Beer's Law: A = εcl, solve for c
      const c = absorbance / (extinction * pathLength);
      const result = formatWithSigFigs(c);
      setDisplay(`c = ${result} M`);
      addToHistory(`A = ε·c·l → c = A/(ε·l)`, `c = ${result} M`);
    } else if (!isNaN(extinction) && !isNaN(concentration) && !isNaN(pathLength) && extinction > 0) {
      // Calculate absorbance
      const A = extinction * concentration * pathLength;
      const result = formatWithSigFigs(A);
      setDisplay(`A = ${result}`);
      addToHistory(`A = ε·c·l`, `A = ${result}`);
    } else {
      setDisplay('Hata: Geçerli değerler girin');
    }
  };

  const calculateColligative = () => {
    const molality = parseFloat(colligativeInputs.molality);
    const kf = parseFloat(colligativeInputs.kf);
    const kb = parseFloat(colligativeInputs.kb);
    const i = parseFloat(colligativeInputs.ionizationFactor);
    const moles = parseFloat(colligativeInputs.moles);
    const solventMoles = parseFloat(colligativeInputs.solventMoles);
    
    if (!isNaN(molality) && !isNaN(kf) && !isNaN(i)) {
      // Freezing point depression
      const deltaT = kf * molality * i;
      const result = formatWithSigFigs(deltaT);
      setDisplay(`ΔTf = ${result} °C`);
      addToHistory(`ΔTf = Kf·m·i = ${kf}×${molality}×${i}`, `${result} °C`);
    } else if (!isNaN(molality) && !isNaN(kb) && !isNaN(i)) {
      // Boiling point elevation
      const deltaT = kb * molality * i;
      const result = formatWithSigFigs(deltaT);
      setDisplay(`ΔTb = ${result} °C`);
      addToHistory(`ΔTb = Kb·m·i = ${kb}×${molality}×${i}`, `${result} °C`);
    } else if (!isNaN(moles) && !isNaN(solventMoles) && solventMoles > 0) {
      // Mole fraction (Raoult's law)
      const moleFraction = moles / (moles + solventMoles);
      const result = formatWithSigFigs(moleFraction);
      setDisplay(`X = ${result}`);
      addToHistory(`X = n_solute/(n_solute + n_solvent)`, `X = ${result}`);
    } else {
      setDisplay('Hata: Geçerli değerler girin');
    }
  };

  // Handle mouse events for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (calculatorRef.current) {
      const rect = calculatorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 600, e.clientY - dragOffset.y))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  // Basic calculator functions
  const inputNumber = (num: string) => {
    playButtonClickSound();
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    playButtonClickSound();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    playButtonClickSound();
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    playButtonClickSound();
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      const formattedResult = formatWithSigFigs(newValue);

      setDisplay(formattedResult);
      setPreviousValue(newValue);
      
      if (nextOperation === '=') {
        addToHistory(`${currentValue} ${operation} ${inputValue}`, formattedResult);
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '*':
        return firstValue * secondValue;
      case '/':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const calculatePercentage = () => {
    playButtonClickSound();
    const value = parseFloat(display);
    const result = value / 100;
    const formattedResult = formatWithSigFigs(result);
    setDisplay(formattedResult);
    addToHistory(`${value}%`, formattedResult);
  };

  const calculateSquareRoot = () => {
    playButtonClickSound();
    const value = parseFloat(display);
    if (value >= 0) {
      const result = Math.sqrt(value);
      const formattedResult = formatWithSigFigs(result);
      setDisplay(formattedResult);
      addToHistory(`√${value}`, formattedResult);
    } else {
      setDisplay('Error');
    }
  };

  const toggleSign = () => {
    playButtonClickSound();
    const value = parseFloat(display);
    const result = -value;
    setDisplay(String(result));
  };

  if (!isVisible) return null;

  return (
    <div
      ref={calculatorRef}
      className="calculator-overlay"
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      <div className={`calculator ${isMinimized ? 'minimized' : ''}`}>
        {/* Calculator Header */}
        <div 
          className="calculator-header"
          onMouseDown={handleMouseDown}
        >
          <div className="calculator-header-left">
            <span className="calculator-title">🧮 Hesap Makinesi</span>
            <div className="sf-control">
              <label>SF:</label>
              <select 
                value={significantFigures} 
                onChange={(e) => setSignificantFigures(parseInt(e.target.value))}
                onClick={e => e.stopPropagation()}
              >
                {[2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="calculator-header-controls">
            <button
              className="calculator-minimize"
              onClick={(e) => {
                e.stopPropagation();
                playButtonClickSound();
                setIsMinimized(!isMinimized);
              }}
            >
              {isMinimized ? '□' : '−'}
            </button>
            <button
              className="calculator-close"
              onClick={(e) => {
                e.stopPropagation();
                playButtonClickSound();
                onClose();
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Mode Toggle */}
            <div className="calculator-tabs">
              <button 
                className={`calc-tab ${!showChemistry && !showAcademic ? 'active' : ''}`}
                onClick={() => {
                  playButtonClickSound();
                  setShowChemistry(false);
                  setShowAcademic(false);
                }}
              >
                🧮 Temel
              </button>
              <button 
                className={`calc-tab ${showChemistry && !showAcademic ? 'active' : ''}`}
                onClick={() => {
                  playButtonClickSound();
                  setShowChemistry(true);
                  setShowAcademic(false);
                }}
              >
                ⚗️ Kimya
              </button>
              <button 
                className={`calc-tab ${showAcademic ? 'active' : ''}`}
                onClick={() => {
                  playButtonClickSound();
                  setShowChemistry(false);
                  setShowAcademic(true);
                }}
              >
                🎓 AKADEMİK MOD
              </button>
              <button 
                className={`calc-tab ${showHistory ? 'active' : ''}`}
                onClick={() => {
                  playButtonClickSound();
                  setShowHistory(!showHistory);
                }}
              >
                📝 Geçmiş
              </button>
            </div>

            {/* Display */}
            <div className="calculator-display">
              <div className="calculator-screen">{display}</div>
            </div>

            {/* History Panel */}
            {showHistory && (
              <div className="calculator-history">
                <div className="history-header">
                  <span>Son 20 İşlem</span>
                  <div className="history-controls">
                    <button onClick={() => navigator.clipboard?.writeText(history.map(h => `${h.operation} = ${h.result}`).join('\n'))}>
                      📋 Kopyala
                    </button>
                    <button onClick={() => setHistory([])}>🗑️ Temizle</button>
                  </div>
                </div>
                <div className="history-list">
                  {history.length === 0 ? (
                    <div className="history-empty">Henüz işlem yok</div>
                  ) : (
                    history.map(entry => (
                      <div key={entry.id} className="history-entry">
                        <div className="history-operation">{entry.operation}</div>
                        <div className="history-result">{entry.result}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Chemistry Calculations */}
            {showChemistry && (
              <div className="chemistry-panel">
                <div className="chemistry-tabs">
                  {[
                    { key: 'mol', label: 'Mol', icon: '⚖️' },
                    { key: 'dilution', label: 'Seyreltme', icon: '🧪' },
                    { key: 'gas', label: 'Gaz', icon: '🌡️' },
                    { key: 'convert', label: 'Birim', icon: '🔄' },
                    { key: 'formula', label: 'Formül', icon: '🧬' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`chem-tab ${activeChemTab === tab.key ? 'active' : ''}`}
                      onClick={() => {
                        playButtonClickSound();
                        setActiveChemTab(tab.key as any);
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <div className="chemistry-content">
                  {activeChemTab === 'mol' && (
                    <div className="chem-section">
                      <h4>Mol & Molarite Hesabı</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Kütle:</label>
                          <input
                            type="number"
                            value={molInputs.mass}
                            onChange={(e) => setMolInputs({...molInputs, mass: e.target.value})}
                            placeholder="0"
                          />
                          <select
                            value={molInputs.massUnit}
                            onChange={(e) => setMolInputs({...molInputs, massUnit: e.target.value})}
                          >
                            <option value="mg">mg</option>
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label>Molar Kütle:</label>
                          <input
                            type="number"
                            value={molInputs.molarMass}
                            onChange={(e) => setMolInputs({...molInputs, molarMass: e.target.value})}
                            placeholder="g/mol"
                          />
                          <span className="unit">g/mol</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateMol}>
                          Mol Hesapla
                        </button>
                      </div>

                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Mol:</label>
                          <input
                            type="number"
                            value={molarityInputs.mol}
                            onChange={(e) => setMolarityInputs({...molarityInputs, mol: e.target.value})}
                            placeholder="0"
                          />
                          <span className="unit">mol</span>
                        </div>
                        <div className="input-group">
                          <label>Hacim:</label>
                          <input
                            type="number"
                            value={molarityInputs.volume}
                            onChange={(e) => setMolarityInputs({...molarityInputs, volume: e.target.value})}
                            placeholder="0"
                          />
                          <select
                            value={molarityInputs.volumeUnit}
                            onChange={(e) => setMolarityInputs({...molarityInputs, volumeUnit: e.target.value})}
                          >
                            <option value="mL">mL</option>
                            <option value="L">L</option>
                          </select>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateMolarity}>
                          Molarite Hesapla
                        </button>
                      </div>
                    </div>
                  )}

                  {activeChemTab === 'dilution' && (
                    <div className="chem-section">
                      <h4>Seyreltme (C₁V₁ = C₂V₂)</h4>
                      <div className="chem-inputs">
                        <div className="dilution-grid">
                          <div className="input-group">
                            <label>C₁ (M):</label>
                            <input
                              type="number"
                              value={dilutionInputs.c1}
                              onChange={(e) => setDilutionInputs({...dilutionInputs, c1: e.target.value})}
                              placeholder="İlk konsantrasyon"
                            />
                          </div>
                          <div className="input-group">
                            <label>V₁:</label>
                            <input
                              type="number"
                              value={dilutionInputs.v1}
                              onChange={(e) => setDilutionInputs({...dilutionInputs, v1: e.target.value})}
                              placeholder="İlk hacim"
                            />
                            <select
                              value={dilutionInputs.v1Unit}
                              onChange={(e) => setDilutionInputs({...dilutionInputs, v1Unit: e.target.value})}
                            >
                              <option value="mL">mL</option>
                              <option value="L">L</option>
                            </select>
                          </div>
                          <div className="input-group">
                            <label>C₂ (M):</label>
                            <input
                              type="number"
                              value={dilutionInputs.c2}
                              onChange={(e) => setDilutionInputs({...dilutionInputs, c2: e.target.value})}
                              placeholder="Son konsantrasyon"
                            />
                          </div>
                          <div className="input-group">
                            <label>V₂:</label>
                            <input
                              type="number"
                              value={dilutionInputs.v2}
                              onChange={(e) => setDilutionInputs({...dilutionInputs, v2: e.target.value})}
                              placeholder="Son hacim"
                            />
                            <select
                              value={dilutionInputs.v2Unit}
                              onChange={(e) => setDilutionInputs({...dilutionInputs, v2Unit: e.target.value})}
                            >
                              <option value="mL">mL</option>
                              <option value="L">L</option>
                            </select>
                          </div>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateDilution}>
                          Hesapla (3/4 değer girin)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeChemTab === 'gas' && (
                    <div className="chem-section">
                      <h4>İdeal Gaz Kanunu (PV = nRT)</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>R sabiti:</label>
                          <select
                            value={gasInputs.rConstant}
                            onChange={(e) => setGasInputs({...gasInputs, rConstant: e.target.value})}
                          >
                            <option value="0.082057">0.082057 L·atm·K⁻¹·mol⁻¹</option>
                            <option value="8.314">8.314 J·mol⁻¹·K⁻¹</option>
                          </select>
                        </div>
                        <div className="gas-grid">
                          <div className="input-group">
                            <label>Basınç (P):</label>
                            <input
                              type="number"
                              value={gasInputs.pressure}
                              onChange={(e) => setGasInputs({...gasInputs, pressure: e.target.value})}
                              placeholder="Basınç"
                            />
                            <select
                              value={gasInputs.pressureUnit}
                              onChange={(e) => setGasInputs({...gasInputs, pressureUnit: e.target.value})}
                            >
                              <option value="atm">atm</option>
                              <option value="kPa">kPa</option>
                              <option value="bar">bar</option>
                            </select>
                          </div>
                          <div className="input-group">
                            <label>Hacim (V):</label>
                            <input
                              type="number"
                              value={gasInputs.volume}
                              onChange={(e) => setGasInputs({...gasInputs, volume: e.target.value})}
                              placeholder="Hacim"
                            />
                            <span className="unit">L</span>
                          </div>
                          <div className="input-group">
                            <label>Sıcaklık (T):</label>
                            <input
                              type="number"
                              value={gasInputs.temp}
                              onChange={(e) => setGasInputs({...gasInputs, temp: e.target.value})}
                              placeholder="Sıcaklık"
                            />
                            <select
                              value={gasInputs.tempUnit}
                              onChange={(e) => setGasInputs({...gasInputs, tempUnit: e.target.value})}
                            >
                              <option value="K">K</option>
                              <option value="C">°C</option>
                            </select>
                          </div>
                          <div className="input-group">
                            <label>Mol (n):</label>
                            <input
                              type="number"
                              value={gasInputs.moles}
                              onChange={(e) => setGasInputs({...gasInputs, moles: e.target.value})}
                              placeholder="Mol sayısı"
                            />
                            <span className="unit">mol</span>
                          </div>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateGas}>
                          Hesapla (3/4 değişken girin)
                        </button>
                      </div>
                    </div>
                  )}

                  {activeChemTab === 'formula' && (
                    <div className="chem-section">
                      <h4>Formülden Molar Kütle</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Kimyasal Formül:</label>
                          <input
                            type="text"
                            value={formulaInput}
                            onChange={(e) => setFormulaInput(e.target.value)}
                            placeholder="ör: H2SO4, CuSO4·5H2O"
                          />
                        </div>
                        <button className="chem-calc-btn" onClick={calculateFormulaWeight}>
                          Molar Kütle Hesapla
                        </button>
                        <div className="formula-examples">
                          <p><strong>Örnekler:</strong></p>
                          <p>H2O, H2SO4, CaCl2, C6H12O6, CuSO4·5H2O</p>
                        </div>
                        {molarMassResult && (
                          <div className="formula-result">
                            <button 
                              onClick={() => setMolInputs({...molInputs, molarMass: molarMassResult.toString()})}
                              className="use-result-btn"
                            >
                              Mol hesabında kullan
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Mini Periodic Table */}
                      <div className="mini-periodic-table">
                        <h5>Hızlı Element Seçimi:</h5>
                        <div className="element-grid">
                          {allElements.slice(0, 20).map(element => (
                            <button
                              key={element.z}
                              className="mini-element"
                              onClick={() => {
                                playButtonClickSound();
                                setFormulaInput(prev => prev + element.symbol);
                              }}
                              title={`${element.name_tr} (${element.mass})`}
                            >
                              {element.symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Academic Calculations */}
            {showAcademic && (
              <div className="chemistry-panel">
                <div className="chemistry-tabs">
                  {[
                    { key: 'stoichiometry', label: 'Stokiyometri', icon: '⚗️' },
                    { key: 'ph', label: 'pH & Çözelti', icon: '🧪' },
                    { key: 'thermodynamics', label: 'Termodinamik', icon: '🌡️' },
                    { key: 'kinetics', label: 'Kinetik', icon: '⚡' },
                    { key: 'electrochemistry', label: 'Elektrokimya', icon: '🔋' },
                    { key: 'spectroscopy', label: 'Spektroskopi', icon: '🌈' },
                    { key: 'colligative', label: 'Koligatif', icon: '❄️' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`chem-tab ${activeAcademicTab === tab.key ? 'active' : ''}`}
                      onClick={() => {
                        playButtonClickSound();
                        setActiveAcademicTab(tab.key as any);
                      }}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                <div className="chemistry-content">
                  {activeAcademicTab === 'stoichiometry' && (
                    <div className="chem-section">
                      <h4>Stokiyometri & Tepkime Hesabı</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Kütle:</label>
                          <input
                            type="number"
                            value={stoichiometryInputs.mass}
                            onChange={(e) => setStoichiometryInputs({...stoichiometryInputs, mass: e.target.value})}
                            placeholder="0"
                          />
                          <select
                            value={stoichiometryInputs.massUnit}
                            onChange={(e) => setStoichiometryInputs({...stoichiometryInputs, massUnit: e.target.value})}
                          >
                            <option value="mg">mg</option>
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                          </select>
                        </div>
                        <div className="input-group">
                          <label>Molar Kütle:</label>
                          <input
                            type="number"
                            value={stoichiometryInputs.molarMass}
                            onChange={(e) => setStoichiometryInputs({...stoichiometryInputs, molarMass: e.target.value})}
                            placeholder="g/mol"
                          />
                          <span className="unit">g/mol</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateStoichiometry}>
                          Mol Hesapla
                        </button>
                      </div>

                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Gerçek Verim:</label>
                          <input
                            type="number"
                            value={stoichiometryInputs.actualYield}
                            onChange={(e) => setStoichiometryInputs({...stoichiometryInputs, actualYield: e.target.value})}
                            placeholder="0"
                          />
                          <span className="unit">g</span>
                        </div>
                        <div className="input-group">
                          <label>Teorik Verim:</label>
                          <input
                            type="number"
                            value={stoichiometryInputs.theoreticalYield}
                            onChange={(e) => setStoichiometryInputs({...stoichiometryInputs, theoreticalYield: e.target.value})}
                            placeholder="0"
                          />
                          <span className="unit">g</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateStoichiometry}>
                          % Verim Hesapla
                        </button>
                      </div>

                      <div className="formula-examples">
                        <p><strong>Formüller:</strong></p>
                        <p>Mol = kütle / molar kütle</p>
                        <p>% Verim = (Gerçek verim / Teorik verim) × 100</p>
                        <p><strong>Örnek:</strong> 2 H₂ + O₂ → 2 H₂O</p>
                      </div>
                    </div>
                  )}

                  {activeAcademicTab === 'ph' && (
                    <div className="chem-section">
                      <h4>Çözelti Dengeleri & pH</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Konsantrasyon [H⁺]:</label>
                          <input
                            type="number"
                            value={phInputs.concentration}
                            onChange={(e) => setPhInputs({...phInputs, concentration: e.target.value})}
                            placeholder="0.001"
                          />
                          <span className="unit">M</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculatePH}>
                          pH Hesapla (Güçlü Asit)
                        </button>
                      </div>

                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Ka:</label>
                          <input
                            type="number"
                            value={phInputs.ka}
                            onChange={(e) => setPhInputs({...phInputs, ka: e.target.value})}
                            placeholder="1.8e-5"
                          />
                        </div>
                        <div className="input-group">
                          <label>Konsantrasyon:</label>
                          <input
                            type="number"
                            value={phInputs.concentration}
                            onChange={(e) => setPhInputs({...phInputs, concentration: e.target.value})}
                            placeholder="0.1"
                          />
                          <span className="unit">M</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculatePH}>
                          pH Hesapla (Zayıf Asit)
                        </button>
                      </div>

                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>pKa:</label>
                          <input
                            type="number"
                            value={phInputs.pkKa}
                            onChange={(e) => setPhInputs({...phInputs, pkKa: e.target.value})}
                            placeholder="4.76"
                          />
                        </div>
                        <div className="input-group">
                          <label>[A⁻]:</label>
                          <input
                            type="number"
                            value={phInputs.bufferBase}
                            onChange={(e) => setPhInputs({...phInputs, bufferBase: e.target.value})}
                            placeholder="0.10"
                          />
                        </div>
                        <div className="input-group">
                          <label>[HA]:</label>
                          <input
                            type="number"
                            value={phInputs.bufferAcid}
                            onChange={(e) => setPhInputs({...phInputs, bufferAcid: e.target.value})}
                            placeholder="0.20"
                          />
                        </div>
                        <button className="chem-calc-btn" onClick={calculatePH}>
                          Tampon pH
                        </button>
                      </div>

                      <div className="formula-examples">
                        <p><strong>Formüller:</strong></p>
                        <p>Güçlü asit: pH = −log[H⁺]</p>
                        <p>Zayıf asit: [H⁺] = √(Ka·C)</p>
                        <p>Tampon: pH = pKa + log([A⁻]/[HA])</p>
                      </div>
                    </div>
                  )}

                  {activeAcademicTab === 'thermodynamics' && (
                    <div className="chem-section">
                      <h4>Termodinamik</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>ΔH:</label>
                          <input
                            type="number"
                            value={thermoInputs.enthalpy}
                            onChange={(e) => setThermoInputs({...thermoInputs, enthalpy: e.target.value})}
                            placeholder="-95"
                          />
                          <span className="unit">kJ/mol</span>
                        </div>
                        <div className="input-group">
                          <label>ΔS:</label>
                          <input
                            type="number"
                            value={thermoInputs.entropy}
                            onChange={(e) => setThermoInputs({...thermoInputs, entropy: e.target.value})}
                            placeholder="-100"
                          />
                          <span className="unit">J/(mol·K)</span>
                        </div>
                        <div className="input-group">
                          <label>T:</label>
                          <input
                            type="number"
                            value={thermoInputs.temp}
                            onChange={(e) => setThermoInputs({...thermoInputs, temp: e.target.value})}
                            placeholder="298"
                          />
                          <span className="unit">K</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateThermodynamics}>
                          ΔG Hesapla
                        </button>
                      </div>

                      <div className="formula-examples">
                        <p><strong>Formüller:</strong></p>
                        <p>ΔG = ΔH − TΔS</p>
                        <p>ΔG° = −R·T·lnK</p>
                        <p>Van't Hoff: ln(K₂/K₁) = −ΔH°/R · (1/T₂ − 1/T₁)</p>
                      </div>
                    </div>
                  )}

                  {activeAcademicTab === 'kinetics' && (
                    <div className="chem-section">
                      <h4>Kinetik</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>k (hız sabiti):</label>
                          <input
                            type="number"
                            value={kineticsInputs.rateConstant}
                            onChange={(e) => setKineticsInputs({...kineticsInputs, rateConstant: e.target.value})}
                            placeholder="0.693"
                          />
                          <span className="unit">s⁻¹</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateKinetics}>
                          Yarı Ömür Hesapla
                        </button>
                      </div>

                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Ea:</label>
                          <input
                            type="number"
                            value={kineticsInputs.activationEnergy}
                            onChange={(e) => setKineticsInputs({...kineticsInputs, activationEnergy: e.target.value})}
                            placeholder="50"
                          />
                          <span className="unit">kJ/mol</span>
                        </div>
                        <div className="input-group">
                          <label>A (frekans faktörü):</label>
                          <input
                            type="number"
                            value={kineticsInputs.frequency}
                            onChange={(e) => setKineticsInputs({...kineticsInputs, frequency: e.target.value})}
                            placeholder="1e13"
                          />
                        </div>
                        <div className="input-group">
                          <label>T:</label>
                          <input
                            type="number"
                            value={kineticsInputs.temp}
                            onChange={(e) => setKineticsInputs({...kineticsInputs, temp: e.target.value})}
                            placeholder="298"
                          />
                          <span className="unit">K</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateKinetics}>
                          Arrhenius k
                        </button>
                      </div>

                      <div className="formula-examples">
                        <p><strong>Formüller:</strong></p>
                        <p>Yarı ömür (1. derece): t½ = 0.693/k</p>
                        <p>Arrhenius: k = A·e^(-Ea/RT)</p>
                      </div>
                    </div>
                  )}

                  {activeAcademicTab === 'electrochemistry' && (
                    <div className="chem-section">
                      <h4>Elektrokimya</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>E°:</label>
                          <input
                            type="number"
                            value={electroInputs.standardPotential}
                            onChange={(e) => setElectroInputs({...electroInputs, standardPotential: e.target.value})}
                            placeholder="1.10"
                          />
                          <span className="unit">V</span>
                        </div>
                        <div className="input-group">
                          <label>n (elektron sayısı):</label>
                          <input
                            type="number"
                            value={electroInputs.electrons}
                            onChange={(e) => setElectroInputs({...electroInputs, electrons: e.target.value})}
                            placeholder="2"
                          />
                        </div>
                        <div className="input-group">
                          <label>Q (reaksiyon oranı):</label>
                          <input
                            type="number"
                            value={electroInputs.reactionQuotient}
                            onChange={(e) => setElectroInputs({...electroInputs, reactionQuotient: e.target.value})}
                            placeholder="10"
                          />
                        </div>
                        <button className="chem-calc-btn" onClick={calculateElectrochemistry}>
                          Nernst E
                        </button>
                      </div>

                      <div className="formula-examples">
                        <p><strong>Formüller:</strong></p>
                        <p>Nernst: E = E° − (0.05916/n) log Q</p>
                        <p>ΔG° = −n·F·E°</p>
                        <p>Faraday: m = (I·t·M)/(n·F)</p>
                      </div>
                    </div>
                  )}

                  {activeAcademicTab === 'spectroscopy' && (
                    <div className="chem-section">
                      <h4>Spektroskopi & Analitik</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>A (soğurma):</label>
                          <input
                            type="number"
                            value={spectroInputs.absorbance}
                            onChange={(e) => setSpectroInputs({...spectroInputs, absorbance: e.target.value})}
                            placeholder="0.900"
                          />
                        </div>
                        <div className="input-group">
                          <label>ε (molar soğurma katsayısı):</label>
                          <input
                            type="number"
                            value={spectroInputs.extinction}
                            onChange={(e) => setSpectroInputs({...spectroInputs, extinction: e.target.value})}
                            placeholder="18000"
                          />
                          <span className="unit">M⁻¹cm⁻¹</span>
                        </div>
                        <div className="input-group">
                          <label>l (yol uzunluğu):</label>
                          <input
                            type="number"
                            value={spectroInputs.pathLength}
                            onChange={(e) => setSpectroInputs({...spectroInputs, pathLength: e.target.value})}
                            placeholder="1"
                          />
                          <span className="unit">cm</span>
                        </div>
                        <button className="chem-calc-btn" onClick={calculateSpectroscopy}>
                          Konsantrasyon
                        </button>
                      </div>

                      <div className="formula-examples">
                        <p><strong>Beer Yasası:</strong> A = ε·c·l</p>
                        <p><strong>Örnek:</strong> ε=18000, l=1 cm, A=0.900 → c=5.0×10⁻⁵ M</p>
                      </div>
                    </div>
                  )}

                  {activeAcademicTab === 'colligative' && (
                    <div className="chem-section">
                      <h4>Koligatif Özellikler</h4>
                      <div className="chem-inputs">
                        <div className="input-group">
                          <label>Molalite (m):</label>
                          <input
                            type="number"
                            value={colligativeInputs.molality}
                            onChange={(e) => setColligativeInputs({...colligativeInputs, molality: e.target.value})}
                            placeholder="1"
                          />
                          <span className="unit">m</span>
                        </div>
                        <div className="input-group">
                          <label>Kf:</label>
                          <input
                            type="number"
                            value={colligativeInputs.kf}
                            onChange={(e) => setColligativeInputs({...colligativeInputs, kf: e.target.value})}
                            placeholder="1.86"
                          />
                          <span className="unit">°C·kg/mol</span>
                        </div>
                        <div className="input-group">
                          <label>i (iyonlaşma faktörü):</label>
                          <input
                            type="number"
                            value={colligativeInputs.ionizationFactor}
                            onChange={(e) => setColligativeInputs({...colligativeInputs, ionizationFactor: e.target.value})}
                            placeholder="2"
                          />
                        </div>
                        <button className="chem-calc-btn" onClick={calculateColligative}>
                          Donma Noktası
                        </button>
                      </div>

                      <div className="formula-examples">
                        <p><strong>Formüller:</strong></p>
                        <p>ΔTf = Kf·m·i (donma noktası alçalması)</p>
                        <p>ΔTb = Kb·m·i (kaynama noktası yükselmesi)</p>
                        <p>Raoult: Psolution = Xsolvent·P°solvent</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Basic Calculator Buttons */}
            {!showChemistry && !showAcademic && (
              <div className="calculator-buttons">
                {/* First Row */}
                <button className="calc-btn calc-btn-function" onClick={clear}>C</button>
                <button className="calc-btn calc-btn-function" onClick={toggleSign}>±</button>
                <button className="calc-btn calc-btn-function" onClick={calculatePercentage}>%</button>
                <button className="calc-btn calc-btn-operation" onClick={() => performOperation('/')}>÷</button>

                {/* Second Row */}
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('7')}>7</button>
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('8')}>8</button>
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('9')}>9</button>
                <button className="calc-btn calc-btn-operation" onClick={() => performOperation('*')}>×</button>

                {/* Third Row */}
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('4')}>4</button>
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('5')}>5</button>
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('6')}>6</button>
                <button className="calc-btn calc-btn-operation" onClick={() => performOperation('-')}>−</button>

                {/* Fourth Row */}
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('1')}>1</button>
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('2')}>2</button>
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('3')}>3</button>
                <button className="calc-btn calc-btn-operation" onClick={() => performOperation('+')}>+</button>

                {/* Fifth Row */}
                <button className="calc-btn calc-btn-function" onClick={calculateSquareRoot}>√</button>
                <button className="calc-btn calc-btn-number" onClick={() => inputNumber('0')}>0</button>
                <button className="calc-btn calc-btn-number" onClick={inputDecimal}>.</button>
                <button className="calc-btn calc-btn-equals" onClick={() => performOperation('=')}>=</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Calculator;