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
  const {stats,
    macAddress,
    successMacAddress,
    idSV,
    successIdSV,
    idVlan,
    successIdVlan,
    connectFunc,
    disconnectFunc,
    setTimeFunc,
    readTimeFunc,
    recordMacConnectedFunc,
    recordIdSVFunc,
    recordIdVlanFunc
  } = useTouDevice();


  return (
    <VStack>
      <Header />
      <Toaster />

      <DeviceControls
        onConnect={connectFunc}
        onDisconnect={disconnectFunc}
        // onSetTime={setTimeFunc}
        onRefreshTime={readTimeFunc}
      />

      <HStack gap={20}>
        <DeviceStats stats={stats} />
        <Calendar onTime={setTimeFunc}/>
      </HStack>

      <MacAddressDevices macAddress={macAddress} successMacAddress={successMacAddress} onMacAddress={recordMacConnectedFunc}/>
      <DeviceId idSV={idSV} idVlan={idVlan} successIdSV={successIdSV} successIdVlan={successIdVlan} onIdVlan={recordIdVlanFunc} onIdSV={recordIdSVFunc}/>
    </VStack>
  );
}

export default App; 