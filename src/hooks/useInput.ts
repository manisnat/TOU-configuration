import { useState } from "react";

interface UseVlanInputPops {
    newMacAddress: string;
    newIdVlan: string;
    newIdSV: string;
    handleChangeMacAddress: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeIdVlan: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeIdSV: (event: React.ChangeEvent<HTMLInputElement>) => void;
    resetMacAddress: () => void;
    resetIdVlan: () => void;
    resetIdSV: () => void;
}

export function useInput(): UseVlanInputPops {
    const [newMacAddress, setNewMacAddress] = useState('');
    const [newIdVlan, setNewIdVlan] = useState('');
    const [newIdSV, setNewIdSV] = useState('');

    const handleChangeMacAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setNewMacAddress(value);
    }

    const handleChangeIdVlan = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setNewIdVlan(value);
    }

    const handleChangeIdSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setNewIdSV(value);
    }

    const resetMacAddress = () => {
        setNewMacAddress('');
    }

    const resetIdVlan = () => {
        setNewIdVlan('');
    }

    const resetIdSV = () => {
        setNewIdSV('');
    }

    return {
        newMacAddress,
        newIdVlan,
        newIdSV,
        handleChangeMacAddress,
        handleChangeIdVlan,
        handleChangeIdSV,
        resetMacAddress,
        resetIdVlan,
        resetIdSV,
    };
}