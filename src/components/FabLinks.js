// FabLinks.js
import React from 'react';
import { FAB, Portal, Provider } from 'react-native-paper';

const FabLinks = ({ navigation }) => {
  const [state, setState] = React.useState({ open: false });

  const onStateChange = ({ open }) => setState({ open });

  const { open } = state;

  return (
    <Provider>
      <Portal>
        <FAB.Group
          open={open}
          icon={open ? 'close' : 'plus'}
          actions={[
            {
              icon: 'car',
              label: 'Share a Ride',
              onPress: () => navigation.navigate('RideShare'),
            },
            {
              icon: 'home',
              label: 'Share an Airbnb',
              onPress: () => navigation.navigate('AirbnbShare'),
            },
            {
              icon: 'basket',
              label: 'Share an Item',
              onPress: () => navigation.navigate('ItemShare'),
            },
            {
              icon: 'star',
              label: 'Share an Experience',
              onPress: () => navigation.navigate('ExperienceShare'),
            },
            {
              icon: 'airplane',
              label: 'Share Your Flight Itinerary',
              onPress: () => navigation.navigate('FlightItinerary'),
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // Do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </Provider>
  );
};

export default FabLinks;
