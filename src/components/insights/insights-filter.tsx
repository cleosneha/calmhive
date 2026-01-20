"use client";

import { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableYears } from "@/utils/insights-date-helper";
import {
  YearOption,
  PeriodOption,
  FilterChangeParams,
  getYearLabel,
  getPeriodLabel,
  getAvailablePeriods,
} from "@/types/insights-filter";

interface InsightsFilterProps {
  onFilterChange: (params: FilterChangeParams) => void;
}

export function InsightsFilter({ onFilterChange }: InsightsFilterProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<YearOption>(currentYear);
  const [period, setPeriod] = useState<PeriodOption>("current-month");
  const availableYears = getAvailableYears();
  const availablePeriods = getAvailablePeriods(year);
  const isInitialLoad = useRef(true);

  // Trigger initial filter on mount only once
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      onFilterChange({ year, period });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value) as YearOption;
    setYear(newYear);

    // Auto-adjust period if not available for selected year
    const newAvailablePeriods = getAvailablePeriods(newYear);
    const newPeriod = newAvailablePeriods.includes(period)
      ? period
      : newAvailablePeriods[0];

    if (newPeriod !== period) {
      setPeriod(newPeriod);
    }

    onFilterChange({ year: newYear, period: newPeriod });
  };

  const handlePeriodChange = (value: string) => {
    const newPeriod = value as PeriodOption;
    setPeriod(newPeriod);
    onFilterChange({ year, period: newPeriod });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      {/* Year Filter */}
      <Select value={year.toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="w-[100px] sm:w-[110px] h-9 text-xs sm:text-sm bg-white border-slate-300 hover:border-[var(--ch-sage-dark)] focus:ring-[var(--ch-sage-dark)]">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {availableYears.map((y) => (
            <SelectItem
              key={y}
              value={y.toString()}
              className="text-xs sm:text-sm cursor-pointer hover:bg-[var(--ch-sage-light)]/20"
            >
              {getYearLabel(y)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Period Filter */}
      <Select value={period} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[140px] sm:w-[150px] h-9 text-xs sm:text-sm bg-white border-slate-300 hover:border-[var(--ch-sage-dark)] focus:ring-[var(--ch-sage-dark)]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {availablePeriods.map((p) => (
            <SelectItem
              key={p}
              value={p}
              className="text-xs sm:text-sm cursor-pointer hover:bg-[var(--ch-sage-light)]/20"
            >
              {getPeriodLabel(p)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
