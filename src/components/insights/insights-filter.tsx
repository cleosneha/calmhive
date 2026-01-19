"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableYears } from "@/utils/insights-date-helper";

export type PeriodFilter = "current-month" | "current-year";
export type YearFilter = number | null;

interface InsightsFilterProps {
  onFilterChange: (period: PeriodFilter, year: YearFilter) => void;
}

export function InsightsFilter({ onFilterChange }: InsightsFilterProps) {
  const [periodFilter, setPeriodFilter] =
    useState<PeriodFilter>("current-month");
  const [yearFilter, setYearFilter] = useState<YearFilter>(null);
  const availableYears = getAvailableYears();
  const currentYear = new Date().getFullYear();

  const handlePeriodChange = (value: PeriodFilter) => {
    setPeriodFilter(value);
    // Reset year filter when changing period
    if (value !== "current-year") {
      setYearFilter(null);
      onFilterChange(value, null);
    } else {
      onFilterChange(value, yearFilter);
    }
  };

  const handleYearChange = (value: string) => {
    const year = parseInt(value);
    setYearFilter(year);
    onFilterChange(periodFilter, year);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      {/* Period Filter */}
      <Select value={periodFilter} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-[140px] h-9 text-sm bg-white border-slate-300 hover:border-[var(--ch-sage-dark)] focus:ring-[var(--ch-sage-dark)]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem
            value="current-month"
            className="text-sm cursor-pointer hover:bg-[var(--ch-sage-light)]/20"
          >
            Current Month
          </SelectItem>
          <SelectItem
            value="current-year"
            className="text-sm cursor-pointer hover:bg-[var(--ch-sage-light)]/20"
          >
            Current Year
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Year Filter - Only show if current-year is selected */}
      {periodFilter === "current-year" && (
        <Select
          value={yearFilter?.toString() || currentYear.toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[100px] h-9 text-sm bg-white border-slate-300 hover:border-[var(--ch-sage-dark)] focus:ring-[var(--ch-sage-dark)]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {availableYears.map((year) => (
              <SelectItem
                key={year}
                value={year.toString()}
                className="text-sm cursor-pointer hover:bg-[var(--ch-sage-light)]/20"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
