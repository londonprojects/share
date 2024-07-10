import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import HitchhikeRequestScreen from '././src/screens/HitchhikeRequestScreen';

enableScreens();

const Stack = createStackNavigator();


import HomeScreen from './src/screens/HomeScreen';
import RideShareScreen from './src/screens/RideShareScreen';
import RidesScreen from './src/screens/RidesScreen';
import AirbnbShareScreen from './src/screens/AirbnbShareScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ItemShareScreen from './src/screens/ItemShareScreen';
import ExperienceShareScreen from './src/screens/ExperienceShareScreen';
import AuthScreen from './src/screens/AuthScreen';
import SharingScreen from './src/screens/SharingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MessengerScreen from './src/screens/MessengerScreen';
import { updateUserLocation } from '././src/services/location';
import { listenForHitchhikingRequests } from '././src/services/hitchhiking';
// import EditProfileScreen from './src/screens/EditProfileScreen';

const App = () => {
  useEffect(() => {
    const locationInterval = setInterval(() => {
      updateUserLocation();
    }, 60000); // Update location every 60 seconds
  
    listenForHitchhikingRequests();
  
    return () => clearInterval(locationInterval);
  }, []);
  
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Auth">
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="HitchhikeRequest" component={HitchhikeRequestScreen} options={{ title: 'Request a Hitchhike' }} />
            <Stack.Screen name="RideShare" component={RideShareScreen} options={{ title: 'Share a Ride' }} />
            <Stack.Screen name="Sharing" component={SharingScreen} />
            <Stack.Screen name="AirbnbShare" component={AirbnbShareScreen} />
            <Stack.Screen name="ItemShare" component={ItemShareScreen} />
            <Stack.Screen name="ExperienceShare" component={ExperienceShareScreen} />
            <Stack.Screen name="Schedule" component={ScheduleScreen} />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{
                headerShown: false,
                gestureEnabled: true,
                cardOverlayEnabled: true,
                ...TransitionPresets.ModalSlideFromBottomIOS,
              }}
            />
            {/* <Stack.Screen name="EditProfile" component={EditProfileScreen} /> */}
            <Stack.Screen name="Messenger" component={MessengerScreen} options={{ title: 'Messenger' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
