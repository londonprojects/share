import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import CheckBox from '@react-native-community/checkbox';
import { auth } from '../services/firebase'; // Make sure to import your firebase configuration

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remindMe, setRemindMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    const trimmedEmail = email.replace(/\s+/g, ''); // Remove all spaces from the email
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage(''); // Clear any previous error messages

    try {
      await auth.signInWithEmailAndPassword(trimmedEmail, trimmedPassword);
      if (remindMe) {
        // Save the user's credentials securely if remind me is checked
        // This is just a placeholder, in a real app you would use secure storage
        console.log('User opted to be reminded');
      }
      navigation.navigate('Home'); // Navigate to your home screen after login
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/login-background.jpg')} // Ensure you have the background image in your assets
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Sign in</Text>
        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        <TextInput
          placeholder="Email"
          placeholderTextColor="#ffffff"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ffffff"
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <IconButton
            icon={showPassword ? "eye-off" : "eye"}
            color="#ffffff"
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          />
        </View>
        <View style={styles.remindMeContainer}>
          <CheckBox
            value={remindMe}
            onValueChange={setRemindMe}
            tintColors={{ true: '#ffffff', false: '#ffffff' }}
          />
          <Text style={styles.remindMeText}>Remind Me</Text>
        </View>
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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 10, // Reduced margin to avoid extra space
    borderRadius: 5,
    paddingHorizontal: 10,
    color: '#ffffff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 10, // Reduced margin to avoid extra space
    borderRadius: 5,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    color: '#ffffff',
  },
  eyeIcon: {
    marginRight: 10,
  },
  remindMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  remindMeText: {
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
