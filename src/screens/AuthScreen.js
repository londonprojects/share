import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { auth } from '../services/firebase'; // Make sure to import your firebase configuration

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigation.navigate('Home'); // Navigate to your home screen after login
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/login-background.jpg')} // Ensure you have the background image in your assets
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sign in</Text>
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
        <Button mode="contained" onPress={handleLogin} style={styles.button}>
          Sign in
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>Forgot your password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
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

export default AuthScreen;
