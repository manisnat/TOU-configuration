import { VStack } from "@chakra-ui/react";
import { Header } from "./components/layuot/Header";
import { DeviceControls } from "./components/device/DeviceControls";
import { DeviceStats } from "./components/device/DeviceStats";
import { useTouDevice } from "./hooks/useTouDevice";

function App() {  
  const {stats,
    connectFunc,
    disconnectFunc,
    setTimeFunc,
    readTimeFunc
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
    </VStack>
  );
}

export default App; 