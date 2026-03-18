import { VStack } from "@chakra-ui/react";
import { Header } from "./components/layout/Header";
import { DeviceControls } from "./components/device/DeviceControls";
import { DeviceStats } from "./components/device/DeviceStats";
import { useTouDevice } from "./hooks/useTouDevice";
import { MacAddressDevices } from "./components/device/MacAddress";
import { DeviceId } from "./components/device/DeviceId";

function App() {  
  const {stats,
    macAddress,
    connectFunc,
    disconnectFunc,
    setTimeFunc,
    readTimeFunc,
    recordMacConnectedFunc,
    recordIdSVFunc,
    recordIdVlanFunc,
    idSV,
    idVlan
  } = useTouDevice();


  return (
    <VStack>
      <Header />

      <DeviceControls
        onConnect={connectFunc}
        onDisconnect={disconnectFunc}
        onSetTime={setTimeFunc}
        onRefreshTime={readTimeFunc}
      />

      <DeviceStats stats={stats} />
      <MacAddressDevices macAddress={macAddress} onMacAddress={recordMacConnectedFunc}/>
      <DeviceId idSV={idSV} idVlan={idVlan} onIdVlan={recordIdVlanFunc} onIdSV={recordIdSVFunc}/>
    </VStack>
  );
}

export default App; 