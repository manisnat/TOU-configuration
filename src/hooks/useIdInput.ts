import { useState } from "react";

interface UseVlanInputPops {
    newIdVlan: string;
    newIdSV: string;
    handleChangeIdVlan: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeIdSV: (event: React.ChangeEvent<HTMLInputElement>) => void;
    resetIdVlan: () => void;
    resetIdSV: () => void;
}

export function useIdInput(): UseVlanInputPops {
    const [newIdVlan, setNewIdVlan] = useState('');
    const [newIdSV, setNewIdSV] = useState('');

    const handleChangeIdVlan = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setNewIdVlan(value);
    }

    const handleChangeIdSV = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setNewIdSV(value);
    }

    const resetIdVlan = () => {
        setNewIdVlan('');
    }

    const resetIdSV = () => {
        setNewIdSV('');
    }

    return {
        newIdVlan,
        newIdSV,
        handleChangeIdVlan,
        handleChangeIdSV,
        resetIdVlan,
        resetIdSV,
    };
}