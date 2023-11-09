import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Linking } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { tailwind } from 'tailwind';
import { format } from 'date-fns';
import { isEmpty, getDistance } from 'utils';
import MapView, { Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const OrderRouteMap = ({ order, onPress, wrapperStyle, containerStyle, onMapReady }) => {
    const map = useRef();
    const isMultiDropOrder = !isEmpty(order.getAttribute('payload.waypoints', []));

    const getCurrentLeg = order => {
        const payload = order.getAttribute('payload');
        const { waypoints, current_waypoint } = payload;

        if (!isMultiDropOrder) {
            return false;
        }

        return waypoints.find(waypoint => {
            return waypoint.id === current_waypoint;
        });
    };

    const getFirstWaypoint = order => {
        const payload = order.getAttribute('payload');

        if (payload?.pickup) {
            return payload.pickup;
        }

        const firstWaypoint = payload.waypoints[0] ?? payload?.dropoff;

        if (firstWaypoint) {
            firstWaypoint.completed = firstWaypoint.status_code === 'COMPLETED';
        }

        return firstWaypoint;
    };

    const getLastWaypoint = order => {
        const payload = order.getAttribute('payload');

        if (payload?.dropoff) {
            return payload.dropoff;
        }

        const lastWaypoint = payload.waypoints[payload.waypoints.length - 1] ?? null;

        if (lastWaypoint) {
            lastWaypoint.completed = lastWaypoint.status_code === 'COMPLETED';
        }

        return lastWaypoint;
    };

    const getMiddleWaypoints = order => {
        const payload = order.getAttribute('payload');
        const { waypoints, pickup, dropoff } = payload;

        if (!pickup && !dropoff && waypoints.length) {
            const middleWaypoints = waypoints.slice(1, waypoints.length - 1);

            middleWaypoints.forEach(waypoint => {
                waypoint.completed = waypoint.status_code === 'COMPLETED';
            });

            return middleWaypoints;
        }

        return waypoints ?? [];
    };

    const startCall = phone => {
        if (phone) {
            Linking.openURL(`tel:${phone}`);
        }
    };

    const currentLeg = getCurrentLeg(order);
    const firstWaypoint = getFirstWaypoint(order);
    const lastWaypoint = getLastWaypoint(order);
    const middleWaypoints = getMiddleWaypoints(order) ?? [];
    const payload = order.getAttribute('payload');

    const initialRegionCoordinates = {
        latitude: firstWaypoint?.location.coordinates[1],
        longitude: firstWaypoint?.location.coordinates[0],
    };

    const generateMapLink = () => {
        var latDes = lastWaypoint.location.coordinates[1];
        var longDes = lastWaypoint.location.coordinates[0];
        const url = 'https://www.google.com/maps/dir/?api=1';
        var origin = '&origin=' + firstWaypoint.location.coordinates[1] + ',' + firstWaypoint.location.coordinates[0];
        var destination = '&destination=' + latDes + ',' + longDes;
        var newUrl = url + origin + destination;
        return newUrl;
    };

    const getDirections = () => {
        const direction = order.status;
        var latDes = lastWaypoint.location.coordinates[1];
        var longDes = lastWaypoint.location.coordinates[0];
        var origin = firstWaypoint.location.coordinates[1] + ',' + firstWaypoint.location.coordinates[0];
        var destination = latDes + ',' + longDes;
        const url = 'https://maps.google.com/maps?saddr=My+Location&daddr=';
        var newUrl = direction === 'driver_pickedup' || direction === 'driver_enroute' ? url + destination : url + origin;
        console.log(newUrl);
        return newUrl;
    };

    return (
        <View style={[tailwind(''), wrapperStyle]}>
            <View style={tailwind('flex items-center')}>
                <TouchableOpacity style={tailwind('bg-blue-500 py-2 px-4 rounded mb-3')} onPress={() => Linking.openURL(generateMapLink())}>
                    <Text style={tailwind('text-xl font-semibold text-white')}>View Route on Google Map</Text>
                </TouchableOpacity>
                {order.status !== 'completed' && (
                    <TouchableOpacity style={tailwind('bg-green-500 py-2 px-4 rounded mb-3')} onPress={() => Linking.openURL(getDirections())}>
                        <Text style={tailwind('text-xl font-semibold text-white')}>Get Next Stop Directions</Text>
                    </TouchableOpacity>
                )}
            </View>
            <MapView
                ref={map}
                onMapReady={() => {
                    if (typeof onMapReady === 'function') {
                        onMapReady(map);
                    }
                }}
                minZoomLevel={12}
                maxZoomLevel={20}
                style={tailwind('w-full h-60 rounded-md shadow-sm')}
                initialRegion={{
                    ...initialRegionCoordinates,
                    latitudeDelta: 1.0922,
                    longitudeDelta: 0.0421,
                }}>
                {firstWaypoint && (
                    <Marker
                        coordinate={{
                            latitude: firstWaypoint.location.coordinates[1],
                            longitude: firstWaypoint.location.coordinates[0],
                        }}>
                        <View style={tailwind('bg-blue-500 shadow-sm rounded-full w-8 h-8 flex items-center justify-center')}>
                            <Text style={tailwind('font-bold text-white')}>P</Text>
                        </View>
                    </Marker>
                )}

                {middleWaypoints.map((waypoint, i) => (
                    <Marker
                        key={i}
                        coordinate={{
                            latitude: waypoint.location.coordinates[1],
                            longitude: waypoint.location.coordinates[0],
                        }}>
                        <View style={tailwind('bg-green-500 shadow-sm rounded-full w-8 h-8 flex items-center justify-center')}>
                            <Text style={tailwind('font-bold text-white')}>{i + 2 === 2 ? 'D' : i + 2}</Text>
                        </View>
                    </Marker>
                ))}

                {lastWaypoint && (
                    <Marker
                        coordinate={{
                            latitude: lastWaypoint.location.coordinates[1],
                            longitude: lastWaypoint.location.coordinates[0],
                        }}>
                        <View style={tailwind('bg-red-500 shadow-sm rounded-full w-8 h-8 flex items-center justify-center')}>
                            <Text style={tailwind('font-bold text-white')}>{middleWaypoints.length + 2 === 2 ? 'D' : middleWaypoints.length + 2}</Text>
                        </View>
                    </Marker>
                )}
            </MapView>
        </View>
    );
};

export default OrderRouteMap;
