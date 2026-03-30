import { useState } from "react";

interface UseMacAddressPops {
  newMacAddress: string;
  isErrorMac: boolean;
  errorMessageMac: string;
  validMacAddress: (value: string) => boolean;
  handleChangeMacAddress: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function useMacAddress(): UseMacAddressPops {
  const [newMacAddress, setNewMacAddress] = useState('');
  const [isErrorMac, setIsErrorMac] = useState(false);
  const [errorMessageMac, setErrorMessageMac] = useState('');

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

  return {
    newMacAddress,
    isErrorMac,
    errorMessageMac,
    validMacAddress,
    handleChangeMacAddress,
  };
}