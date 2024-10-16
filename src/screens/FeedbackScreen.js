import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

const FeedbackScreen = () => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    // Here you would typically send the feedback to your server
    console.log('Feedback submitted:', feedback);
    Alert.alert('Thank You!', 'Your feedback has been submitted.');
    setFeedback('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>We Value Your Feedback</Text>
      <TextInput
        label="Your Feedback"
        value={feedback}
        onChangeText={setFeedback}
        multiline
        numberOfLines={5}
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Submit Feedback
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default FeedbackScreen;