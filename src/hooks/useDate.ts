import { useState } from "react";
import { type DateValue } from "@chakra-ui/react";

interface UseDateProps {
  dateValue: DateValue | null;
  isErrorDate: boolean;
  errorMessageDate: string;
  year: number;
  month: number;
  day: number;
  hours: string;
  minutes: string;
  seconds: string;
  timezone: string;
  validDate: (value: DateValue | null) => boolean;
  handleDateValue: (value: DateValue) => void;
  handleHours: (value: string) => void;
  handleMinutes: (value: string) => void;
  handleSeconds: (value: string) => void;
  handleTimezone: (value: string) => void;
}

export function useDate(): UseDateProps {
  const [dateValue, setDateValue] = useState<DateValue | null>(null);
  const [isErrorDate, setIsErrorDate] = useState(false);
  const [errorMessageDate, setErrorMessageDate] = useState('');
  const [year, setYear] = useState(2000);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [timezone, setTimezone] = useState("+0700");

  const handleDateValue = (value: DateValue) => {
    setDateValue(value);

    const date = new Date(value.year, value.month - 1, value.day);
    
    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
    setDay(date.getDate());
  }

  const validDate = (value: DateValue | null) => {
    if (value === null) {
      setIsErrorDate(true);
      setErrorMessageDate("Дата не может быть пустой");
      return false;
    } 
    else {
      setIsErrorDate(false);
      setErrorMessageDate("");
      return true;
    }
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
    isErrorDate,
    errorMessageDate,
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    timezone,
    validDate,
    handleDateValue,
    handleHours,
    handleMinutes,
    handleSeconds,
    handleTimezone
  };
}