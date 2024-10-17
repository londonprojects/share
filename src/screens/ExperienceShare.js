import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, TextInput, Text, useTheme, Provider as PaperProvider } from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { firestore, auth } from '../services/firebase';
import CustomAppBar from '../components/CustomAppBar';
import CustomTabBar from '../components/TabsComponent';

function ExperienceShareScreen({ navigation }) {
  const [experienceDetails, setExperienceDetails] = useState({ name: '', description: '', price: 0 });
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const [activeTab, setActiveTab] = useState(4); // Set to 4 for Experience tab
  const { colors } = useTheme();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserProfilePhoto(user.photoURL);
    }
  }, []);

  const handleShare = () => {
    const user = auth.currentUser;
    if (user) {
      const experienceWithUser = {
        ...experienceDetails,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        dateListed: new Date(),
      };

      firestore.collection('experiences').add(experienceWithUser)
        .then(() => {
          Alert.alert("Success", "Experience shared successfully!");
          navigation.navigate('Home');
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    } else {
      Alert.alert("Error", "User not logged in.");
    }
  };

  const handleSetActiveTab = useCallback((index) => {
    setActiveTab(index);
    switch(index) {
      case 0:
        navigation.navigate('Home');
        break;
      case 1:
        navigation.navigate('RidesScreen');
        break;
      case 2:
        navigation.navigate('AirbnbScreen');
        break;
      case 3:
        navigation.navigate('ItemShareScreen');
        break;
      case 4:
        navigation.navigate('ExperienceShareScreen');
        break;
    }
  }, [navigation]);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <CustomAppBar navigation={navigation} userProfilePhoto={userProfilePhoto} />
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Share an Experience</Text>
            <TextInput
              label="Name"
              value={experienceDetails.name}
              onChangeText={(text) => setExperienceDetails({ ...experienceDetails, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={experienceDetails.description}
              onChangeText={(text) => setExperienceDetails({ ...experienceDetails, description: text })}
              style={styles.input}
              multiline
              numberOfLines={4}
            />
            <Text style={styles.sliderLabel}>Price: ${experienceDetails.price}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1000}
              step={1}
              value={experienceDetails.price}
              onValueChange={(value) => setExperienceDetails({ ...experienceDetails, price: value })}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#000000"
            />
            <Button mode="contained" onPress={handleShare} style={styles.button}>
              Share Experience
            </Button>
          </ScrollView>
        </View>
        <CustomTabBar
          state={{
            index: activeTab,
            routes: [
              { key: 'home', name: 'Home' },
              { key: 'rides', name: 'Rides' },
              { key: 'airbnb', name: 'Airbnb' },
              { key: 'items', name: 'Items' },
              { key: 'experiences', name: 'Experiences' },
            ]
          }}
          navigation={navigation}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '80%',
    marginBottom: 16,
  },
  sliderLabel: {
    width: '80%',
    textAlign: 'left',
    marginBottom: 8,
  },
  slider: {
    width: '80%',
    height: 40,
    marginBottom: 16,
  },
  button: {
    width: '80%',
    marginBottom: 16,
  },
});

export default ExperienceShareScreen;
