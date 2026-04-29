import { Stack, VStack, Box } from "@chakra-ui/react";
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
    <Box p={2}>
      <Box width="100%" display="flex" justifyContent="right">
        <ColorModeButton bg={"bg.emphasized"} />
      </Box>

      <WebSerialChecker>
        <VStack 
          gap={8} 
          padding={5}
        >
          <Header />
          <Toaster />

          <DeviceControls
            onConnect={connectFunc}
            onDisconnect={disconnectFunc}
          />

          <Stack 
            direction={{ base: "column", lg: "row"}}
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            gap={50}
          >
            <Box 
              minW="200px"
              padding={5}
            >
              <DeviceStats 
                onRefreshTime={readTimeFunc}
                onRefreshOperTime={readOperTimeFunc}
              />
            </Box>
            <Stack 
              gap={8}
              minW="500px"
            >
              <DeviceId 
                onIdVlan={recordIdVlanFunc} 
                onIdSV={recordIdSVFunc}
              />
              <MacAddressDevices 
                onMacAddress={recordMacConnectedFunc}
              />
            </Stack>
            
            <Calendar 
              onTime={setTimeFunc}
            />
          </Stack>
          
        </VStack>
        
      </WebSerialChecker>
    </Box>
  );
}

export default App; 