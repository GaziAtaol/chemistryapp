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
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChemTab, setActiveChemTab] = useState<'mol' | 'dilution' | 'gas' | 'convert' | 'formula'>('mol');
  
  // Chemistry calculation states
  const [molInputs, setMolInputs] = useState({ mass: '', molarMass: '', massUnit: 'g' });
  const [molarityInputs, setMolarityInputs] = useState({ mol: '', volume: '', volumeUnit: 'L' });
  const [dilutionInputs, setDilutionInputs] = useState({ c1: '', v1: '', c2: '', v2: '', v1Unit: 'mL', v2Unit: 'mL' });
  const [gasInputs, setGasInputs] = useState({ pressure: '', volume: '', temp: '', moles: '', pressureUnit: 'atm', volumeUnit: 'L', tempUnit: 'K', rConstant: '0.082057' });
  const [formulaInput, setFormulaInput] = useState('');
  const [molarMassResult, setMolarMassResult] = useState<number | null>(null);
  
  // Dragging functionality
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Format number with significant figures
  const formatWithSigFigs = (num: number): string => {
    if (num === 0) return '0';
    const str = num.toPrecision(significantFigures);
    return parseFloat(str).toString();
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
    let tempK = t;
    if (gasInputs.tempUnit === 'C') {
      tempK = t + 273.15;
      setDisplay(`Note: ${t}°C = ${tempK} K`);
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
            <span className="calculator-title">🧮 Kimya Hesap Makinesi</span>
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
            {/* Chemistry Section Toggle */}
            <div className="calculator-tabs">
              <button 
                className={`calc-tab ${!showChemistry ? 'active' : ''}`}
                onClick={() => {
                  playButtonClickSound();
                  setShowChemistry(false);
                }}
              >
                🧮 Temel
              </button>
              <button 
                className={`calc-tab ${showChemistry ? 'active' : ''}`}
                onClick={() => {
                  playButtonClickSound();
                  setShowChemistry(true);
                }}
              >
                ⚗️ Kimya
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

            {/* Basic Calculator Buttons */}
            {!showChemistry && (
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