/**
 * @format
 */

import { AppRegistry, Alert } from 'react-native';
import '@azure/core-asynciterator-polyfill';
import App from './App';
import { name as appName } from './app.json';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import { EventRegister } from 'react-native-event-listeners';
import { set } from 'utils/Storage';
import { PermissionsAndroid } from 'react-native';
PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

const { emit } = EventRegister;

/**
 * Push Notifications Configurations
 * We will just use EventRegister to pass up.
 */
PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function (token) {
        console.log('[PushNotification.onRegister() #token]', token);
        emit('onNotificationsRegister', token);
        set('token', token);
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
        console.log('[PushNotification.onNotification() #notification]', notification);
        emit('onNotification', notification);

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: function (notification) {
        console.log('[PushNotification.onAction() #notification.action]', notification.action);
        console.log('[PushNotification.onAction() #notification]', notification);
        emit('onNotificationsAction', notification);
    },

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError: function (err) {
        console.log('[PushNotification.onRegistrationError() #err]', err.message, err);
        emit('onNotificationsRegistrationError', err);
    },

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
        alert: true,
        badge: true,
        sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     */
    requestPermissions: true,
});

async function onMessageReceived(message) {
    const { notification = {} } = message || {};
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
    });
    // Display a notification
    await notifee.displayNotification({
        title: notification?.title || 'New Message',
        body: notification?.body || 'Open app for update',
        android: {
            channelId,
            // pressAction is needed if you want the notification to open the app when pressed
            pressAction: {
                id: 'default',
            },
        },
    });
}

messaging().onMessage(onMessageReceived);
messaging().setBackgroundMessageHandler(onMessageReceived);
AppRegistry.registerComponent(appName, () => App);
