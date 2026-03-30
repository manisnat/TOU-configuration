import { useState } from "react";
import { type DateValue } from "@chakra-ui/react";

interface UseDateProps {
  dateValue: DateValue | null;
  year: number;
  month: number;
  day: number;
  hours: string;
  minutes: string;
  seconds: string;
  timezone: string;
  handleDateValue: (value: DateValue) => void;
  handleHours: (value: string) => void;
  handleMinutes: (value: string) => void;
  handleSeconds: (value: string) => void;
  handleTimezone: (value: string) => void;
}

export function useDate(): UseDateProps {
  const [dateValue, setDateValue] = useState<DateValue | null>(null);
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [timezone, setTimezone] = useState("+07");

  const handleDateValue = (value: DateValue) => {
    setDateValue(value);

    const date = new Date(value.year, value.month - 1, value.day);
    
    setYear(+date.toLocaleDateString('ru-RU', {year: 'numeric'}));
    setMonth(+date.toLocaleDateString('ru-RU', {month: 'numeric'}));
    setDay(+date.toLocaleDateString('ru-RU', {day: 'numeric'}));
  }

  const handleHours = (value: string) => {
    setHours(value);
  }

  const handleMinutes = (value: string) => {
    setMinutes(value);
  }

  const handleSeconds = (value: string) => {
    setSeconds(value);
  }

  const handleTimezone = (value: string) => {
    setTimezone(value);
  };

  return {
    dateValue,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    timezone,
    handleDateValue,
    handleHours,
    handleMinutes,
    handleSeconds,
    handleTimezone
  };
}