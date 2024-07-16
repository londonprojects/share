import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { auth, firestore } from '../services/firebase';

const avatarUrls = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  // Add more URLs as needed
];

const getRandomAvatarUrl = () => avatarUrls[Math.floor(Math.random() * avatarUrls.length)];

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleSignUp = async () => {
    try {
      const avatarUrl = getRandomAvatarUrl();

      // Create a new user with email and password
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      // Add additional user information to Firestore
      await firestore.collection('users').doc(uid).set({
        uid, // explicitly add the UID here
        name,
        email,
        photoURL: avatarUrl,
      });

      // Navigate to home screen after successful signup
      navigation.navigate('Home');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/signup-background.jpg')} // Ensure you have the background image in your assets
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sign up</Text>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#ffffff"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ffffff"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#ffffff"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button mode="contained" onPress={handleSignUp} style={styles.button}>
          Sign up
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#ffffff',
  },
  button: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#1E90FF',
  },
  link: {
    color: '#ffffff',
    marginTop: 10,
  },
});

export default SignUpScreen;
