import React, { useState, useCallback } from 'react';
import { View, Text, ImageBackground, TouchableOpacity, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView, Pressable, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getUniqueId } from 'react-native-device-info';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { useLocale, useDriver, useFleetbase } from 'hooks';
import { logError, translate, config, syncDevice, getColorCode, deepGet } from 'utils';
import { getLocation } from 'utils/Geo';
import { set, get } from 'utils/Storage';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';
import tailwind from 'tailwind';
import PhoneInput from 'components/PhoneInput';
import _config from 'config';

const isPhone = (phone = '') => {
    return /\+965[0-9]{8}$/.test(phone);
};
const { ADMIN_API } = _config;

const LoginScreen = ({ navigation, route }) => {
    const fleetbase = useFleetbase();
    const location = getLocation();
    const insets = useSafeAreaInsets();

    const [phone, setPhone] = useState(null);
    const [code, setCode] = useState(null);
    const [isAwaitingVerification, setIsAwaitingVerification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [locale, setLocale] = useLocale();
    const [driver, setDriver] = useDriver();

    const isNotAwaitingVerification = isAwaitingVerification === false;
    const redirectTo = deepGet(route, 'params?.redirectTo', 'MainStack');

    const sendVerificationCode = useCallback(() => {
        setIsLoading(true);
        if (!isPhone(phone)) {
            Toast.show({
                type: 'error',
                text1: 'Phone number is not correct',
                text2: 'Please enter the correct number. It has to be 8 digit only.',
            });
            setIsLoading(false);
            return;
        }
        try {
            return fleetbase.drivers
                .login(phone)
                .then(response => {
                    setIsAwaitingVerification(true);
                    setError(null);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.log('🚀 ~ file: LoginScreen.js:55 ~ sendVerificationCode ~ error:', error);
                    console.log('🚀 ~ file: LoginScreen.js:56 ~ sendVerificationCode ~ log:', error.message);
                    logError(error);
                    setIsAwaitingVerification(true);

                    setIsLoading(false);
                    Toast.show({
                        type: 'error',
                        text1: '😅 Authentication Failed',
                        text2: error.message,
                    });
                    setError(null);
                });
        } catch (error) {
            logError(error);
            setIsLoading(false);
            Toast.show({
                type: 'error',
                text1: '😅 Authentication Failed',
                text2: error.message,
            });
        }
    });
    function generateUniqueCode(text) {
        let hash = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            // Convert to 32-bit integer
            hash = hash & hash;
        }

        // Ensure positive value and limit to 6 digits
        const positiveHash = Math.abs(hash) % 1000000;

        // Pad with zeros if needed
        const uniqueCode = String(positiveHash).padStart(6, '0');

        return uniqueCode;
    }

    const makeOnline = async driverId => {
        if (driverId) {
            await fetch(`${ADMIN_API}/v1/fleetInternal/makeOnline/${driverId}`, {
                method: 'PUT',
            });
        }
    };

    const verifyCode = useCallback(() => {
        setIsLoading(true);
        if (generateUniqueCode(phone) != code) {
            Toast.show({
                type: 'error',
                text1: '😅 Authentication Failed',
                text2: 'OTP is not correct. Connect With your supervisor.',
            });
            setIsLoading(false);
            return;
        }
        return fleetbase.drivers
            .verifyCode(phone, '999000')
            .then(driver => {
                makeOnline(driver?.attributes?.id);
                driver.attributes.online = true;
                setDriver(driver);
                syncDevice(driver);
                setIsLoading(false);

                if (redirectTo) {
                    navigation.navigate(redirectTo);
                } else {
                    navigation.goBack();
                }
            })
            .catch(error => {
                logError(error);
                Toast.show({
                    type: 'error',
                    text1: '😅 Authentication Failed',
                    text2: error.message,
                });
                retry();
            });
    });

    const retry = useCallback(() => {
        setIsLoading(false);
        setPhone(null);
        setIsAwaitingVerification(false);
    });

    return (
        <ImageBackground
            source={config('ui.loginScreen.containerBackgroundImage')}
            resizeMode={config('ui.loginScreen.containerBackgroundResizeMode') ?? 'cover'}
            style={[tailwind('flex-1'), config('ui.loginScreen.containerBackgroundImageStyle')]}>
            <View style={[tailwind('bg-gray-800 flex-row flex-1 items-center justify-center'), config('ui.loginScreen.containerStyle'), { paddingTop: insets.top }]}>
                <View style={tailwind('flex-grow')}>
                    <Pressable onPress={Keyboard.dismiss} style={[tailwind('px-5 -mt-28'), config('ui.loginScreen.contentContainerStyle')]}>
                        <KeyboardAvoidingView style={tailwind('')} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                            <View style={tailwind('mb-10 flex items-center justify-center rounded-full')}>
                                <FastImage source={require('../../../../assets/katch-app-icon.png')} style={tailwind('w-20 h-20 rounded-full')} />
                            </View>

                            {isNotAwaitingVerification && (
                                <View style={[tailwind('p-4'), config('ui.loginScreen.loginFormContainerStyle')]}>
                                    <View style={tailwind('mb-6 flex-row')}>
                                        <PhoneInput
                                            onChangeValue={setPhone}
                                            autoFocus={true}
                                            defaultCountryCode={'KW'}
                                            style={[tailwind('flex-1'), config('ui.loginScreen.phoneInputStyle')]}
                                            {...(config('ui.createAccountScreen.phoneInputProps') ?? {})}
                                        />
                                    </View>
                                    <TouchableOpacity style={tailwind('mb-3')} onPress={sendVerificationCode}>
                                        <View style={[tailwind('btn bg-gray-900 border border-gray-700'), config('ui.loginScreen.sendVerificationCodeButtonStyle')]}>
                                            {isLoading && <ActivityIndicator size={'small'} color={getColorCode('text-blue-500')} style={tailwind('mr-2')} />}
                                            <Text style={[tailwind('font-semibold text-gray-50 text-lg text-center'), config('ui.loginScreen.sendVerificationCodeButtonTextStyle')]}>
                                                {translate('Auth.LoginScreen.sendVerificationCodeButtonText')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                            {isAwaitingVerification && (
                                <View style={[tailwind(''), config('ui.loginScreen.verifyFormContainerStyle')]}>
                                    <View style={tailwind('mb-6')}>
                                        <TextInput
                                            onChangeText={setCode}
                                            autoFocus={true}
                                            textAlign={'center'}
                                            keyboardType={'phone-pad'}
                                            placeholder={translate('Auth.LoginScreen.codeInputPlaceholder')}
                                            placeholderTextColor={'rgba(156, 163, 175, 1)'}
                                            style={[tailwind('form-input flex flex-row text-gray-100 text-center mb-2.5'), config('ui.loginScreen.verifyCodeInputStyle')]}
                                            {...(config('ui.loginScreen.verifyCodeInputProps') ?? {})}
                                        />
                                        <View style={tailwind('flex flex-row justify-end w-full')}>
                                            <TouchableOpacity style={[tailwind('bg-gray-900 bg-opacity-50 px-4 py-2 rounded-md'), config('ui.loginScreen.retryButtonStyle')]} onPress={retry}>
                                                <Text style={[tailwind('text-blue-200 font-semibold'), config('ui.loginScreen.retryButtonTextStyle')]}>
                                                    {translate('Auth.LoginScreen.retryButtonText')}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={verifyCode}>
                                        <View style={[tailwind('btn bg-gray-900 border border-gray-700'), config('ui.loginScreen.verifyCodeButtonStyle')]}>
                                            {isLoading && <ActivityIndicator size={'small'} color={getColorCode('text-blue-500')} style={tailwind('mr-2')} />}
                                            <Text style={[tailwind('font-semibold text-gray-50 text-lg text-center'), config('ui.loginScreen.verifyCodeButtonTextStyle')]}>
                                                {translate('Auth.LoginScreen.verifyCodeButtonText')}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </KeyboardAvoidingView>
                    </Pressable>
                </View>
            </View>
        </ImageBackground>
    );
};

export default LoginScreen;
