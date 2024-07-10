import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

function ExperienceShareScreen({ navigation }) {
  const [experienceDetails, setExperienceDetails] = useState({ name: '', description: '', price: '' });
  const { colors } = useTheme();

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

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Share an Experience</Text>
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
      <TextInput
        label="Price"
        value={experienceDetails.price}
        onChangeText={(text) => setExperienceDetails({ ...experienceDetails, price: text })}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleShare} style={styles.button}>
        Share Experience
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    width: '80%',
    marginBottom: 16,
  },
  button: {
    width: '80%',
    marginBottom: 16,
  },
});

export default ExperienceShareScreen;
