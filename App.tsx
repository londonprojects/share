import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import HitchhikeRequestScreen from './src/screens/HitchhikeRequestScreen';
import theme from './theme';

enableScreens();

const Stack = createStackNavigator();

import HomeScreen from './src/screens/HomeScreen';
import RideShareScreen from './src/screens/RideShareScreen';
import RidesScreen from './src/screens/RidesScreen';
import AirbnbShareScreen from './src/screens/AirbnbShareScreen';
import AirbnbScreen from './src/screens/AirbnbScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ItemShareScreen from './src/screens/ItemShareScreen';
import ItemShare from './src/screens/ItemScreen';
import ExperienceShareScreen from './src/screens/ExperienceShareScreen';
import ExperienceScreen from './src/screens/ExperienceScreen';
import AuthScreen from './src/screens/AuthScreen';
import SharingScreen from './src/screens/SharingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MessengerScreen from './src/screens/MessengerScreen';
import MessageScreen from './src/screens/MessageScreen';
import FlightItineraryScreen from './src/screens/FlightItineraryScreen';
import MatchingItinerariesScreen from './src/screens/MatchingItinerariesScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import MapScreen from './src/screens/MapScreen';
import { updateUserLocation } from './src/services/location';
import { listenForHitchhikingRequests } from './src/services/hitchhiking';
import CommunityScreen from './src/screens/CommunityScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import MessagesListScreen from './src/screens/MessagesListScreen';
import MessagesDetailsScreen from './src/screens/MessageDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';

const addDummyData = async () => {
  const dummyUsers = [
    {
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: 'https://via.placeholder.com/150',
      lastPosted: new Date(),
    },
    {
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      photoURL: 'https://via.placeholder.com/150',
      lastPosted: new Date(),
    },
    {
      displayName: 'Alice Johnson',
      email: 'alice@example.com',
      photoURL: 'https://via.placeholder.com/150',
      lastPosted: new Date(),
    },
  ];

  try {
    const batch = firestore.batch();
    dummyUsers.forEach(user => {
      const docRef = firestore.collection('users').doc();
      batch.set(docRef, user);
    });
    await batch.commit();
    console.log('Dummy users added successfully');
  } catch (error) {
    console.error('Error adding dummy users:', error);
  }
};

const App = () => {
  useEffect(() => {
    // Check if the dummy data needs to be added
    const addDataIfNeeded = async () => {
      const usersSnapshot = await firestore.collection('users').get();
      if (usersSnapshot.empty) {
        await addDummyData();
      }
    };

    addDataIfNeeded();
  }, []);
  
  useEffect(() => {
    const locationInterval = setInterval(() => {
      updateUserLocation();
    }, 60000); // Update location every 60 seconds
  
    listenForHitchhikingRequests();
  
    return () => clearInterval(locationInterval);
  }, []);
  
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Auth">
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }} 
          />
          {/* <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ headerShown: true }} // Example for showing header
          /> */}
          <Stack.Screen 
            name="Rides" 
            component={RidesScreen} 
            options={{ headerShown: false }} // Hide header on RidesScreen
          />
          {/* <Stack.Screen 
            name="MessageScreen" 
            component={MessageScreen} 
            options={{ headerShown: true }} // Example for showing header
          /> */}
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="FlightItinerary" component={FlightItineraryScreen} />
            <Stack.Screen name="MatchingItineraries" component={MatchingItinerariesScreen} />
            <Stack.Screen name="HitchhikeRequest" component={HitchhikeRequestScreen} options={{ title: 'Request a Hitchhike' }} />
            <Stack.Screen name="RideShare" component={RideShareScreen} options={{ title: 'Share a Ride' }} />
            <Stack.Screen name="Sharing" component={SharingScreen} />
            <Stack.Screen name="AirbnbShare" component={AirbnbShareScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ItemShareScreen" component={ItemShareScreen} />
            <Stack.Screen name="ItemShare" component={ItemShare} />
            <Stack.Screen name="ExperienceShareScreen" component={ExperienceShareScreen} />
            <Stack.Screen name="ExperienceShare" component={ExperienceScreen} />
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
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Community" component={CommunityScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="MapScreen" component={MapScreen} />
            <Stack.Screen name="Messenger" component={MessengerScreen} options={{ title: 'Messenger' }} />
            <Stack.Screen name="MessageScreen" component={MessageScreen} options={{ title: 'Message' }} />
            <Stack.Screen name="RidesScreen" component={RidesScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MessagesList" component={MessagesListScreen} />
            <Stack.Screen name="MessageDetail" component={MessagesDetailsScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="AirbnbScreen" component={AirbnbScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
};

export default App;
