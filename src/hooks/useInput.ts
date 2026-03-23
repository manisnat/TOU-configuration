import { useState } from "react";

interface UseVlanInputPops {
  newMacAddress: string;
  isErrorMac: boolean;
  errorMessageMac: string;
  // showSuccessMac: boolean;
  validMacAddress: (value: string) => boolean;
  handleChangeMacAddress: (event: React.ChangeEvent<HTMLInputElement>) => void;

  newIdSV: string;
  isErrorIdSV: boolean;
  errorMessageIdSV: string;
  showSuccessSV: boolean;
  validIdSV: (value: string) => boolean;
  handleChangeIdSV: (event: React.ChangeEvent<HTMLInputElement>) => void;

  newIdVlan: string;
  isErrorIdVlan: boolean;
  errorMessageIdVlan: string;
  showSuccessVlan: boolean;
  validIdVlan: (value: string) => boolean;
  handleChangeIdVlan: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useInput(): UseVlanInputPops {
  const [newMacAddress, setNewMacAddress] = useState('');
  const [isErrorMac, setIsErrorMac] = useState(false);
  const [errorMessageMac, setErrorMessageMac] = useState('');
  const [newIdSV, setNewIdSV] = useState('');
  const [isErrorIdSV, setIsErrorIdSV] = useState(false);
  const [errorMessageIdSV, setErrorMessageIdSV] = useState('');
  const [showSuccessSV, setShowSuccessSV] = useState(false);
  const [newIdVlan, setNewIdVlan] = useState('');
  const [isErrorIdVlan, setIsErrorIdVlan] = useState(false);
  const [errorMessageIdVlan, setErrorMessageIdVlan] = useState('');
  const [showSuccessVlan, setShowSuccessVlan] = useState(false);

  // MAC-address
  function validMacAddress(value: string) {
    const clean = value.replace(/[:\-]/g, '');

    if (value === '') {
      setIsErrorMac(true);
      setErrorMessageMac("MAC-адрес не может быть пустым");
      return false;
    } 
    else if (clean.length !== 12) {
      setIsErrorMac(true);
      setErrorMessageMac("MAC-адрес должен содержать 12 символов");
      return false;
    } 
    else if (!/^[0-9A-Fa-f]{12}$/.test(clean)) {
      setIsErrorMac(true);
      setErrorMessageMac("Только hex символы (0-9, A-F)");
      return false;
    } 
    else {
      setIsErrorMac(false);
      setErrorMessageMac("");
      return true;
    }
  }

  const handleChangeMacAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewMacAddress(value);
    if (value === '') {
      setIsErrorMac(false);
    }
  }

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
      setShowSuccessSV(true);
      setErrorMessageIdSV("");
      return true;
    }
  }

  const handleChangeIdSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\s+/g, '');
    setNewIdSV(value);
    if (value === '') {
      setIsErrorIdSV(false);
      setShowSuccessSV(false);
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
      setShowSuccessVlan(true);
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
      setShowSuccessVlan(false);
    }
  }

  return {
    newMacAddress,
    isErrorMac,
    errorMessageMac,
    validMacAddress,
    handleChangeMacAddress,
    newIdSV,
    isErrorIdSV,
    errorMessageIdSV,
    showSuccessSV,
    validIdSV,
    handleChangeIdSV,
    newIdVlan,
    isErrorIdVlan,
    errorMessageIdVlan,
    showSuccessVlan,
    validIdVlan,
    handleChangeIdVlan,
  };
}