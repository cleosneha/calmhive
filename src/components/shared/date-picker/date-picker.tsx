"use client";

import React, { useState, useRef, useEffect } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface DatePickerProps {
  value: string; // DD/MM/YYYY format
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const YEARS = Array.from({ length: 150 }, (_, i) =>
  (new Date().getFullYear() - i).toString(),
);

interface CustomDropdownProps {
  options: string[];
  value: number;
  onChange: (value: number) => void;
}

function CustomDropdown({ options, value, onChange }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "instant",
        block: "center",
      });
    }
  }, [isOpen]);

  const handleSelect = (index: number) => {
    onChange(index);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-[var(--ch-sage-light)]/30 rounded-md transition-colors border border-[var(--ch-sage-light)]/30"
      >
        {options[value]}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[var(--ch-sage-light)]/30 rounded-lg shadow-lg p-2 min-w-[200px]">
          <div className="grid grid-cols-3 gap-1 max-h-[180px] overflow-y-auto">
            {options.map((option, index) => (
              <button
                key={`${option}-${index}`}
                ref={index === value ? selectedRef : null}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(index);
                }}
                className={`
                  px-3 py-2 text-sm text-center rounded-md transition-colors w-full
                  ${
                    index === value
                      ? "text-[var(--ch-sage-dark)]"
                      : "text-gray-800 hover:bg-[var(--ch-sage-light)]/30 hover:rounded-md"
                  }
                `}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DatePicker({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  disabled = false,
  className = "",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Parse the current value to Date object
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split("/");
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month, day);
  };

  const selectedDate = parseDate(value);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initialize calendar to selected date's month/year when opened (only once)
  useEffect(() => {
    if (isOpen) {
      if (!initializedRef.current && selectedDate) {
        setCurrentMonth(selectedDate.getMonth());
        setCurrentYear(selectedDate.getFullYear());
        initializedRef.current = true;
      }
    } else {
      initializedRef.current = false;
    }
  }, [isOpen, selectedDate]);

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    const formattedDate = selectedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    onChange(formattedDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;

      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentMonth &&
        today.getFullYear() === currentYear;

      const isFutureDate =
        new Date(currentYear, currentMonth, day) >
        new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isFutureDate}
          className={`
            h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors
            ${
              isSelected
                ? " text-[var(--ch-sage-dark)] hover:bg-[var(--ch-sage-dark)]"
                : isToday
                  ? "bg-[var(--ch-sage-light)] text-[var(--ch-sage-dark)]"
                  : "hover:bg-[var(--ch-sage-light)]/50 text-gray-800"
            }
            ${isFutureDate ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {day}
        </button>,
      );
    }

    return days;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          className={`
            w-full px-3 py-2 pr-10 border border-[var(--ch-sage-light)]/30 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-[var(--ch-sage)] focus:border-[var(--ch-sage)]
            disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60
            ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        />
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--ch-sage)] hover:text-[var(--ch-sage-dark)] disabled:opacity-60"
        >
          <FaCalendarAlt className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-[var(--ch-sage-light)]/30 rounded-lg shadow-lg p-4 min-w-[280px]">
          {/* Header with month/year navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="p-1 hover:bg-[var(--ch-sage-light)]/50 rounded transition-colors"
            >
              <FaChevronLeft className="h-4 w-4 text-[var(--ch-sage-dark)]" />
            </button>

            <div className="flex items-center gap-2">
              <CustomDropdown
                options={MONTHS}
                value={currentMonth}
                onChange={(index) => setCurrentMonth(index)}
              />

              <CustomDropdown
                options={YEARS}
                value={YEARS.indexOf(currentYear.toString())}
                onChange={(index) => setCurrentYear(parseInt(YEARS[index], 10))}
              />
            </div>

            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="p-1 hover:bg-[var(--ch-sage-light)]/50 rounded transition-colors"
            >
              <FaChevronRight className="h-4 w-4 text-[var(--ch-sage-dark)]" />
            </button>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day}
                className="h-8 w-8 text-xs font-medium text-[var(--ch-slate)] flex items-center justify-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
}
