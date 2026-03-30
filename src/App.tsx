import { HStack, VStack } from "@chakra-ui/react";
import { Header } from "./components/layout/Header";
import { DeviceControls } from "./components/device/DeviceControls";
import { DeviceStats } from "./components/device/DeviceStats";
import { useTouDevice } from "./hooks/useTouDevice";
import { MacAddressDevices } from "./components/device/MacAddress";
import { DeviceId } from "./components/device/DeviceId";
import { Toaster } from "./components/ui/toaster";
import { Calendar } from "./components/device/Calendar";

function App() {  
  const {
    connected,
    stats,
    macAddress,
    successMacAddress,
    successTime,
    idSV,
    successIdSV,
    idVlan,
    successIdVlan,
    connectFunc,
    disconnectFunc,
    readOperTimeFunc,
    setTimeFunc,
    readTimeFunc,
    recordMacConnectedFunc,
    recordIdSVFunc,
    recordIdVlanFunc
  } = useTouDevice();


  return (
    <VStack gap={5} padding={10}>
      <Header />
      <Toaster />

      <DeviceControls
        connected={connected}
        onConnect={connectFunc}
        onDisconnect={disconnectFunc}
      />

      <HStack gap={20}>
        <DeviceStats 
          connected={connected}
          stats={stats} 
          onRefreshTime={readTimeFunc}
          onRefreshOperTime={readOperTimeFunc}
        />
        <VStack gap={10}>
          <DeviceId 
            connected={connected} 
            idSV={idSV} 
            idVlan={idVlan} 
            successIdSV={successIdSV} 
            successIdVlan={successIdVlan} 
            onIdVlan={recordIdVlanFunc} 
            onIdSV={recordIdSVFunc}
          />
          <MacAddressDevices 
            connected={connected} 
            macAddress={macAddress} 
            successMacAddress={successMacAddress} 
            onMacAddress={recordMacConnectedFunc}
          />
        </VStack>
        
        <Calendar 
          connected={connected} 
          successTime={successTime} 
          onTime={setTimeFunc}
        />
      </HStack>

      
      
    </VStack>
  );
}

export default App; 