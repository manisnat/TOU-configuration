import { create } from 'zustand';

export interface DeviceStats {
  serialNumber: string;
  deviceType: string;
  mainSoftware: string;
  additionalSoftware: string;
  operTime: string;
  currentTime: string;
}

export interface MacAddresses {
  tou: string;     
  connected: string; 
}

export interface LogEntry {
  number: number;
  date: string;
  event: string;
  old: string;
  new: string;
}

export interface Log {
  timeLast: string;
  capacity: number;
  entries: LogEntry[];
}

export interface DeviceState {
  isConnected: boolean;
  error: string | null;

  stats: DeviceStats;
  macAddresses: MacAddresses;
  idSV: string;
  idVlan: string;

  log: Log;
  isLoadingLog: boolean;
  loadingProgressLog: number;

  successFlags: {
    time: boolean;
    macAddress: boolean;
    idSV: boolean;
    idVlan: boolean;
  };

  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;

  setStats: (stats: DeviceStats) => void;
  setMacAddresses: (macAddresses: MacAddresses) => void;
  setIdSV: (idSV: string) => void;
  setIdVlan: (idVlan: string) => void;

  setLog: (log: Log) => void;
  setIsLoadingLog: (isLoading: boolean) => void;
  setLoadingProgressLog: (progress: number) => void;

  setSuccessFlag: (key: keyof DeviceState['successFlags'], value: boolean) => void;
}

const initialStats: DeviceStats = {
  serialNumber: '',
  deviceType: '',
  mainSoftware: '',
  additionalSoftware: '',
  operTime: '',
  currentTime: '',
};

const initialMacAddresses: MacAddresses = {
  tou: '',
  connected: '',
};

const initialLog: Log = {
  timeLast: '',
  capacity: 0,
  entries: [],
};

export const useDeviceStore = create<DeviceState>((set) => ({
  isConnected: false,
  error: null,
  stats: initialStats,
  macAddresses: initialMacAddresses,
  idSV: '',
  idVlan: '',
  log: initialLog,
  isLoadingLog: false,
  loadingProgressLog: 0,
  successFlags: {
    time: false,
    macAddress: false,
    idSV: false,
    idVlan: false,
  },

  setConnected: (connected) => set({ isConnected: connected }),

  setError: (error) => set({ error }),
  
  setStats: (stats) => set({ stats }),
  
  setMacAddresses: (macAddresses) => set({ macAddresses }),
  
  setIdSV: (idSV) => set({ idSV }),
  
  setIdVlan: (idVlan) => set({ idVlan }),

  setLog: (log) => set({ log }),
  setIsLoadingLog: (isLoadingLog) => set({ isLoadingLog }),
  setLoadingProgressLog: (progress) => set({ loadingProgressLog: progress }),
  
  setSuccessFlag: (key, value) => set((state) => ({
    successFlags: { ...state.successFlags, [key]: value }
  })),
}));