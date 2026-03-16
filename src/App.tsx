import { VStack } from "@chakra-ui/react";
import { Header } from "./components/layout/Header";
import { DeviceControls } from "./components/device/DeviceControls";
import { DeviceStats } from "./components/device/DeviceStats";
import { useTouDevice } from "./hooks/useTouDevice";
import { MacAddressDevices } from "./components/device/MacAddress";

function App() {  
  const {stats,
    macAddress,
    connectFunc,
    disconnectFunc,
    setTimeFunc,
    readTimeFunc,
    recordIdVlanFunc,
  } = useTouDevice();


  return (
    <VStack>
      <Header />

      <DeviceControls
        onConnect={connectFunc}
        onDisconnect={disconnectFunc}
        onSetTime={setTimeFunc}
        onRefreshTime={readTimeFunc}
        onRecordIdVlan={recordIdVlanFunc}
      />

      <DeviceStats stats={stats} />
      <MacAddressDevices macAddress={macAddress} />
    </VStack>
  );
}

export default App; 