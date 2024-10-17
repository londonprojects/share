import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Text } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import CheckBox from '@react-native-community/checkbox';
import { auth } from '../services/firebase'; // Make sure to import your firebase configuration
import { validateEmail, validatePassword } from '../utils/validation'; // Assume we have these utility functions

const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remindMe, setRemindMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // Reset error states
    setEmailError('');
    setPasswordError('');
    setErrorMessage('');

    // Validate email
    const emailValidationResult = validateEmail(trimmedEmail);
    if (!emailValidationResult.isValid) {
      setEmailError(emailValidationResult.error);
      return;
    }

    // Validate password
    const passwordValidationResult = validatePassword(trimmedPassword);
    if (!passwordValidationResult.isValid) {
      setPasswordError(passwordValidationResult.error);
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
          style={[styles.input, emailError && styles.inputError]}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        <View style={[styles.passwordContainer, passwordError && styles.inputError]}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#ffffff"
            style={styles.passwordInput}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            secureTextEntry={!showPassword}
          />
          <IconButton
            icon={showPassword ? "eye-off" : "eye"}
            color="#ffffff"
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          />
        </View>
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
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
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
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
