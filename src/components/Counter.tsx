import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export const Counter: React.FC<CounterProps> = ({ 
  value, 
  duration = 0.5, 
  className = "", 
  decimals = 0,
  prefix = "",
  suffix = ""
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const controls = animate(prevValueRef.current, value, {
      duration: duration,
      onUpdate(value) {
        setDisplayValue(value);
      },
      ease: "easeOut"
    });

    prevValueRef.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};
