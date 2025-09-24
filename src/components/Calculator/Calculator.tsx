import React, { useState, useRef, useEffect } from 'react';
import { playButtonClickSound } from '../../utils/audio';

interface CalculatorProps {
  isVisible: boolean;
  onClose: () => void;
}

const Calculator: React.FC<CalculatorProps> = ({ isVisible, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  
  // Dragging functionality
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 350, y: 100 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const calculatorRef = useRef<HTMLDivElement>(null);

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
          x: Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragOffset.x)),
          y: Math.max(0, Math.min(window.innerHeight - 400, e.clientY - dragOffset.y))
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

      setDisplay(String(newValue));
      setPreviousValue(newValue);
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
    setDisplay(String(value / 100));
  };

  const calculateSquareRoot = () => {
    playButtonClickSound();
    const value = parseFloat(display);
    if (value >= 0) {
      setDisplay(String(Math.sqrt(value)));
    } else {
      setDisplay('Error');
    }
  };

  const toggleSign = () => {
    playButtonClickSound();
    const value = parseFloat(display);
    setDisplay(String(-value));
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
      <div className="calculator">
        {/* Calculator Header */}
        <div 
          className="calculator-header"
          onMouseDown={handleMouseDown}
        >
          <span className="calculator-title">🧮 Hesap Makinesi</span>
          <button
            className="calculator-close"
            onClick={() => {
              playButtonClickSound();
              onClose();
            }}
          >
            ✕
          </button>
        </div>

        {/* Display */}
        <div className="calculator-display">
          <div className="calculator-screen">{display}</div>
        </div>

        {/* Buttons */}
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
      </div>
    </div>
  );
};

export default Calculator;