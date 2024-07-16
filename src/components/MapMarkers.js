// components/MapMarkers.js
import React from 'react';
import { Marker } from 'react-native-maps';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const renderMarkerIcon = (type, isDeparture) => {
  let iconName;
  switch (type) {
    case 'ride':
      iconName = "car";
      break;
    case 'itinerary':
      iconName = isDeparture ? "airplane-takeoff" : "airplane-landing";
      break;
    case 'item':
      iconName = "cube-outline";
      break;
    case 'experience':
      iconName = "run";
      break;
    case 'airbnb':
      iconName = "home";
      break;
    default:
      iconName = "map-marker";
  }
  return <MaterialCommunityIcons name={iconName} size={30} color="black" />;
};

const MapMarkers = ({ data, type, handleMarkerPress }) => {
  return (
    <>
      {data.map((item, index) => {
        if (type === 'itinerary') {
          return (
            <>
              {item.departureCoords && item.departureCoords.latitude && item.departureCoords.longitude && (
                <Marker
                  key={`departure-${index}`}
                  coordinate={{ latitude: item.departureCoords.latitude, longitude: item.departureCoords.longitude }}
                  title={item.departureCity}
                  description={`Departure: ${item.userName}`}
                  onPress={() => handleMarkerPress({ ...item, type: 'itinerary', isDeparture: true })}
                >
                  {renderMarkerIcon('itinerary', true)}
                </Marker>
              )}
              {item.arrivalCoords && item.arrivalCoords.latitude && item.arrivalCoords.longitude && (
                <Marker
                  key={`arrival-${index}`}
                  coordinate={{ latitude: item.arrivalCoords.latitude, longitude: item.arrivalCoords.longitude }}
                  title={item.arrivalCity}
                  description={`Arrival: ${item.userName}`}
                  onPress={() => handleMarkerPress({ ...item, type: 'itinerary', isDeparture: false })}
                >
                  {renderMarkerIcon('itinerary', false)}
                </Marker>
              )}
            </>
          );
        }
        return item.location && item.location.latitude && item.location.longitude ? (
          <Marker
            key={index}
            coordinate={{ latitude: item.location.latitude, longitude: item.location.longitude }}
            title={item.title || item.destination || item.name || item.location}
            description={item.description || item.userName}
            onPress={() => handleMarkerPress({ ...item, type })}
          >
            {renderMarkerIcon(type)}
          </Marker>
        ) : null;
      })}
    </>
  );
};

export default MapMarkers;
