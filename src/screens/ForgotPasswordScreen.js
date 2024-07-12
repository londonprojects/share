import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { Button } from 'react-native-paper';
import { auth } from '../services/firebase';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleForgotPassword = async () => {
    try {
      await auth.sendPasswordResetEmail(email);
      alert('Password reset email sent!');
      navigation.navigate('Auth');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/forgot-password-background.jpg')} // Ensure you have the background image in your assets
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ffffff"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <Button mode="contained" onPress={handleForgotPassword} style={styles.button}>
          Send Reset Email
        </Button>
        <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.link}>Back to Sign in</Text>
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

export default ForgotPasswordScreen;
