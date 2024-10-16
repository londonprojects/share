import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';

const HowItWorksScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>How ShareApp Works</Title>
          <Paragraph>ShareApp is designed to connect people who want to share rides, accommodations, items, and experiences. Here's a quick guide on how to use the app:</Paragraph>
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title>1. Create a Profile</Title>
          <Paragraph>Set up your profile with your information and preferences.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>2. Browse Listings</Title>
          <Paragraph>Look through available rides, Airbnbs, items, and experiences.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>3. Make a Request</Title>
          <Paragraph>When you find something you're interested in, send a request to the owner.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>4. Communicate</Title>
          <Paragraph>Use the in-app messaging to discuss details with the owner.</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>5. Share and Enjoy</Title>
          <Paragraph>Meet up, share, and enjoy your shared experience!</Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
});

export default HowItWorksScreen;