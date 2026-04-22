import { HStack, VStack, Box } from "@chakra-ui/react";
import { Header } from "./components/layout/Header";
import { DeviceControls } from "./components/device/DeviceControls";
import { DeviceStats } from "./components/device/DeviceStats";
import { useTouDevice } from "./hooks/useTouDevice";
import { MacAddressDevices } from "./components/device/MacAddress";
import { DeviceId } from "./components/device/DeviceId";
import { Toaster } from "./components/ui/toaster";
import { Calendar } from "./components/device/Calendar";
import { WebSerialChecker } from "./components/transport/WebSerialChecker";
import { ColorModeButton } from "./components/ui/color-mode";

function App() {  
  const {
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
    <VStack padding={2}>
      <Box width="100%" display="flex" justifyContent="flex-end">
        <ColorModeButton bg={"bg.emphasized"} />
      </Box>
    <WebSerialChecker>
      
      <VStack gap={5} padding={5}>
        <Header />
        <Toaster />

        <DeviceControls
          onConnect={connectFunc}
          onDisconnect={disconnectFunc}
        />

        <HStack gap={20}>
          <DeviceStats 
            onRefreshTime={readTimeFunc}
            onRefreshOperTime={readOperTimeFunc}
          />
          <VStack gap={10}>
            <DeviceId 
              onIdVlan={recordIdVlanFunc} 
              onIdSV={recordIdSVFunc}
            />
            <MacAddressDevices 
              onMacAddress={recordMacConnectedFunc}
            />
          </VStack>
          
          <Calendar 
            onTime={setTimeFunc}
          />
        </HStack>
        
      </VStack>
      
    </WebSerialChecker>
    </VStack>
  );
}

export default App; 