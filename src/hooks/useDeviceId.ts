import { useState } from "react";

interface UseDeviceIdPops {
  newIdSV: string;
  isErrorIdSV: boolean;
  errorMessageIdSV: string;
  validIdSV: (value: string) => boolean;
  handleChangeIdSV: (event: React.ChangeEvent<HTMLInputElement>) => void;

  newIdVlan: string;
  isErrorIdVlan: boolean;
  errorMessageIdVlan: string;
  validIdVlan: (value: string) => boolean;
  handleChangeIdVlan: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useDeviceId(): UseDeviceIdPops {
  const [newIdSV, setNewIdSV] = useState('');
  const [isErrorIdSV, setIsErrorIdSV] = useState(false);
  const [errorMessageIdSV, setErrorMessageIdSV] = useState('');
  const [newIdVlan, setNewIdVlan] = useState('');
  const [isErrorIdVlan, setIsErrorIdVlan] = useState(false);
  const [errorMessageIdVlan, setErrorMessageIdVlan] = useState('');

  // SV ID
  function validIdSV(value: string) {
    if (value === '') {
      setIsErrorIdSV(true);
      setErrorMessageIdSV("SV ID не может быть пустым");
      return false;
    } 
    else if (value.length > 12) {
      setIsErrorIdSV(true);
      setErrorMessageIdSV("SV ID не должен превышать 12 символов");
      return false;
    } 
    else {
      setIsErrorIdSV(false);
      setErrorMessageIdSV("");
      return true;
    }
  }

  const handleChangeIdSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\s+/g, '');
    setNewIdSV(value);
    if (value === '') {
      setIsErrorIdSV(false);
    }
  }

  // Vlan ID
  function validIdVlan(value: string): boolean {
    if (value === '') {
      setIsErrorIdVlan(true);
      setErrorMessageIdVlan("Vlan ID не может быть пустым");
      return false;
    } 
    else if (!/^\d+$/.test(value)) {
      setIsErrorIdVlan(true);
      setErrorMessageIdVlan("Vlan ID может содержать только числа");
      return false;
    } 
    else if (value.length > 4) {
      setIsErrorIdVlan(true);
      setErrorMessageIdVlan("Vlan ID не должен превышать 4 символов");
      return false;
    } 
    else if (+value > 4095 || +value < 0) {
      setIsErrorIdVlan(true);
      setErrorMessageIdVlan("Vlan ID должен быть в диапазоне от 0 до 4095");
      return false;
    } 
    else {
      setIsErrorIdVlan(false);
      setErrorMessageIdVlan("");
      return true;
    }
  }

  const handleChangeIdVlan = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value.replace(/[^0-9]/g, '');
    if (+value > 4095) {
      value = '4095';
    }
    setNewIdVlan(value);
    if (value === '') {
      setIsErrorIdVlan(false);
    }
  }

  return {
    newIdSV,
    isErrorIdSV,
    errorMessageIdSV,
    validIdSV,
    handleChangeIdSV,
    newIdVlan,
    isErrorIdVlan,
    errorMessageIdVlan,
    validIdVlan,
    handleChangeIdVlan,
  };
}