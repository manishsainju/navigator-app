import React, { useEffect, useState } from 'react';
import Geolocation from 'react-native-geolocation-service';

export const useBackGroundLocation = () => {
    const [location, setLocation] = useState();
    Geolocation.setRNConfiguration({
        authorizationLevel: 'always', // Request "always" location permission
        skipPermissionRequests: false, // Prompt for permission if not granted
    });

    // update then location every 30 SEC
    useEffect(() => {
        const intervalId = setInterval(() => {
            getLocation();
        }, 1000 * 30);
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const getLocation = () => {
        Geolocation.getCurrentPosition(position => {
            setLocation(position);
        });
    };

    // Watch for position updates
    const watchId = Geolocation.watchPosition(
        position => {
            setLocation(position);

            // Send the position data to the server
        },
        error => {
            console.log(error);
        },
        {
            distanceFilter: 1, // Minimum distance (in meters) to update the location
            interval: 1000 * 15, // Update interval (in milliseconds), which is 15 seconds
            fastestInterval: 5000, // Fastest update interval (in milliseconds)
            accuracy: {
                android: 'highAccuracy',
                ios: 'best',
            },
            showsBackgroundLocationIndicator: true,
            pausesLocationUpdatesAutomatically: false,
            activityType: 'fitness', // Specify the activity type (e.g., 'fitness' or 'other')
            useSignificantChanges: false,
            deferredUpdatesInterval: 0,
            deferredUpdatesDistance: 0,
            foregroundService: {
                notificationTitle: 'Tracking your location',
                notificationBody: 'Enable location tracking to continue', // Add a notification body
            },
        }
    );

    return [location];
};
// Configure Geolocation
