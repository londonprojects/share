import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, RadioButton } from 'react-native-paper';

const ReportConcernScreen = () => {
  const [concernType, setConcernType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // Here you would typically send the report to your server
    console.log('Concern reported:', { concernType, description });
    Alert.alert('Report Submitted', 'Thank you for your report. We will review it shortly.');
    setConcernType('');
    setDescription('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report a Concern</Text>
      <RadioButton.Group onValueChange={value => setConcernType(value)} value={concernType}>
        <RadioButton.Item label="Safety Issue" value="safety" />
        <RadioButton.Item label="Inappropriate Content" value="content" />
        <RadioButton.Item label="Technical Problem" value="technical" />
        <RadioButton.Item label="Other" value="other" />
      </RadioButton.Group>
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={5}
        mode="outlined"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Submit Report
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
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default ReportConcernScreen;