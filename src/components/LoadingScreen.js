// components/LoadingScreen.js

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar, MD3Colors } from 'react-native-paper';

const LoadingScreen = ({ progress, message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message || "Loading..."}</Text>
      <ProgressBar progress={progress} color={MD3Colors.error50} style={styles.progressBar} />
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
  message: {
    fontSize: 18,
    marginBottom: 16,
  },
  progressBar: {
    width: '80%',
    height: 10,
  },
});

export default LoadingScreen;
