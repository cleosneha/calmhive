"use client";

import { useState, useEffect, useRef } from "react";

interface DecodeTextProps {
  text: string;
  className?: string;
}

const SYMBOLS = "$#%^&*@!~?+=-|[]{}()<>/?\\:;'\"`.,";

export default function DecodeText({ text, className = "" }: DecodeTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const iterationRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (intervalRef.current) return; // Prevent multiple animations

    iterationRef.current = 0;
    intervalRef.current = setInterval(() => {
      const chars = text.split("").map((char, index) => {
        if (iterationRef.current > index) {
          return text[index];
        }
        return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      });

      setDisplayText(chars.join(""));
      iterationRef.current += 1 / 2;

      if (iterationRef.current > text.length) {
        setDisplayText(text);
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
      }
    }, 50);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayText(text);
    iterationRef.current = 0;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <span
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
    </span>
  );
}
