import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar } from 'react-native-paper';
import { auth, firestore } from '../services/firebase';
import ImagePicker from 'react-native-image-crop-picker';

const EditProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    photoURL: '',
  });
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setProfile({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      });
      setNewDisplayName(user.displayName);
      setNewPhotoURL(user.photoURL);
    }
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await user.updateProfile({
          displayName: newDisplayName,
          photoURL: newPhotoURL,
        });

        firestore.collection('users').doc(user.uid).set({
          displayName: newDisplayName,
          photoURL: newPhotoURL,
        }, { merge: true });

        Alert.alert("Success", "Profile updated successfully!");
        navigation.navigate('Profile');
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    }
  };

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
    }).then(image => {
      setNewPhotoURL(image.path);
    }).catch(error => {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('ImagePicker Error: ', error);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Avatar.Image size={100} source={{ uri: newPhotoURL }} style={styles.avatar} />
      <Button mode="outlined" onPress={pickImage} style={styles.button}>
        Change Profile Picture
      </Button>
      <TextInput
        label="Display Name"
        value={newDisplayName}
        onChangeText={setNewDisplayName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={profile.email}
        style={styles.input}
        disabled
      />
      <Button mode="contained" onPress={handleSave} style={styles.button}>
        Save Changes
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
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

export default EditProfileScreen;
