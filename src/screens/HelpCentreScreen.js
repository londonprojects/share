import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Text } from 'react-native-paper';

const HelpCentreScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help Centre</Text>
      <List.Section>
        <List.Subheader>Frequently Asked Questions</List.Subheader>
        <List.Item
          title="How do I create an account?"
          description="Tap on the 'Sign Up' button and follow the prompts."
          left={props => <List.Icon {...props} icon="account-plus" />}
        />
        <List.Item
          title="How do I list an item?"
          description="Go to the 'Share' tab and select the type of item you want to list."
          left={props => <List.Icon {...props} icon="plus-circle" />}
        />
        <List.Item
          title="How do I contact support?"
          description="You can reach our support team at support@shareapp.com"
          left={props => <List.Icon {...props} icon="email" />}
        />
      </List.Section>
    </ScrollView>
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
});

export default HelpCentreScreen;