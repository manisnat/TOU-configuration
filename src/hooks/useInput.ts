import { useState } from "react";

interface UseVlanInputPops {
  newMacAddress: string;
  isErrorMac: boolean;
  errorMessageMac: string;
  newIdVlan: string;
  newIdSV: string;
  validMacAddress: (value: string) => void;
  handleChangeMacAddress: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeIdVlan: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleChangeIdSV: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetMacAddress: () => void;
  resetIdVlan: () => void;
  resetIdSV: () => void;
}

export function useInput(): UseVlanInputPops {
  const [newMacAddress, setNewMacAddress] = useState('');
  const [isErrorMac, setIsErrorMac] = useState(false);
  const [errorMessageMac, setErrorMessageMac] = useState('');
  const [newIdVlan, setNewIdVlan] = useState('');
  const [newIdSV, setNewIdSV] = useState('');

  // MAC-address
  function validMacAddress(value: string) {
    const clean = value.replace(/[:\-]/g, '');

    if (value === '') {
      setIsErrorMac(true);
      setErrorMessageMac("MAC-адрес не может быть пустым");
    } else if (clean.length !== 12) {
      setIsErrorMac(true);
      setErrorMessageMac("MAC-адрес должен содержать 12 символов");
    } else if (!/^[0-9A-Fa-f]{12}$/.test(clean)) {
      setIsErrorMac(true);
      setErrorMessageMac("Только hex символы (0-9, A-F)");
    } else {
      setIsErrorMac(false);
      setErrorMessageMac("");
    }
  }

  const handleChangeMacAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    setNewMacAddress(value);
    if (value === '') {
      setIsErrorMac(false);
    }
  }

  const resetMacAddress = () => {
    setNewMacAddress('');
  }

  // SV ID
  const handleChangeIdSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewIdSV(value);
  }

  const resetIdSV = () => {
    setNewIdSV('');
  }

  // Vlan ID
  const handleChangeIdVlan = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setNewIdVlan(value);
  }

  const resetIdVlan = () => {
    setNewIdVlan('');
  }

  return {
    newMacAddress,
    isErrorMac,
    errorMessageMac,
    newIdVlan,
    newIdSV,
    validMacAddress,
    handleChangeMacAddress,
    handleChangeIdVlan,
    handleChangeIdSV,
    resetMacAddress,
    resetIdVlan,
    resetIdSV,
  };
}