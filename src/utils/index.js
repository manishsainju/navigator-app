import {
    listCountries,
    isArray,
    hasRequiredKeys,
    isLastIndex,
    stripHtml,
    stripIframeTags,
    isAndroid,
    isApple,
    isVoid,
    isEmpty,
    isFalsy,
    logError,
    mutatePlaces,
    debounce,
    deepGet,
    config,
    sum,
    getColorCode,
    toBoolean,
    createSocketAndListen,
    listenForOrdersFromSocket,
    createNewOrderLocalNotificationObject
} from './Helper';
import { calculatePercentage, haversine } from './Calculate';
import { syncDevice } from './Auth';
import { formatCurrency, capitalize, pluralize, formatDuration, formatKm, formatMetersToKilometers, formatMetaValue, titleize, humanize, getStatusColors } from './Format';
import { geocode, getCurrentLocation, getLocation, getDistance } from './Geo';
import { translate } from './Localize';
import getCurrency from './get-currency';

const getActiveOrdersCount = (orders = []) => {
    if (!isArray(orders)) {
        return 0;
    }

    let count = 0;

    for (let index = 0; index < orders.length; index++) {
        const order = orders.objectAt(index);

        if (order.getAttribute('status') === 'canceled' || order.getAttribute('status') === 'completed' || !order.isAttributeFilled('payload')) {
            continue;
        }

        count += 1;
    }

    return count;
};

const getActiveOrdersCountWithCompleted = (orders = []) => {
    if (!isArray(orders)) {
        return 0;
    }

    let count = 0;

    for (let index = 0; index < orders.length; index++) {
        const order = orders.objectAt(index);

        if (order.getAttribute('status') === 'canceled' || !order.isAttributeFilled('payload')) {
            continue;
        }

        count += 1;
    }

    return count;
};

const getTotalStops = (orders = []) => {
    if (!isArray(orders)) {
        return 0;
    }

    let stops = 0;

    for (let index = 0; index < orders.length; index++) {
        const order = orders.objectAt(index);

        if (order.getAttribute('status') === 'canceled' || order.getAttribute('status') === 'completed' || !order.isAttributeFilled('payload')) {
            continue;
        }

        stops += order.getAttribute('payload.waypoints.length') + 2;
    }

    return stops;
};

const getTotalDuration = (orders = []) => {
    if (!isArray(orders)) {
        return 0;
    }

    let duration = 0;

    for (let index = 0; index < orders.length; index++) {
        const order = orders.objectAt(index);

        if (order.getAttribute('status') === 'canceled' || order.getAttribute('status') === 'completed' || !order.isAttributeFilled('payload')) {
            continue;
        }

        duration += order.getAttribute('time');
    }

    return duration;
};

const getTotalDistance = (orders = []) => {
    if (!isArray(orders)) {
        return 0;
    }

    let distance = 0;

    for (let index = 0; index < orders.length; index++) {
        const order = orders.objectAt(index);

        if (order.getAttribute('status') === 'canceled' || order.getAttribute('status') === 'completed' || !order.isAttributeFilled('payload')) {
            continue;
        }

        distance += order.getAttribute('distance');
    }

    return distance;
};

const totalCash = (orders = []) => {
    if (!isArray(orders)) {
        return 0;
    }
    const totalCod = orders.reduce((sum, order) => {
        if (order.status !== 'cancelled') {
            const cod = parseFloat(order?.meta?.cash?.replace(/[^\d.]/g, '')) || 0;
            return sum + cod;
        } else {
            return sum;
        }
    }, 0);

    return totalCod;
};

export {
    listCountries,
    isArray,
    hasRequiredKeys,
    isLastIndex,
    stripHtml,
    stripIframeTags,
    isAndroid,
    isApple,
    isVoid,
    isEmpty,
    isFalsy,
    toBoolean,
    logError,
    calculatePercentage,
    haversine,
    syncDevice,
    formatCurrency,
    capitalize,
    pluralize,
    titleize,
    humanize,
    formatMetaValue,
    formatDuration,
    formatKm,
    formatMetersToKilometers,
    getStatusColors,
    geocode,
    getCurrentLocation,
    getLocation,
    mutatePlaces,
    debounce,
    deepGet,
    config,
    sum,
    translate,
    getColorCode,
    getCurrency,
    getDistance,
    getActiveOrdersCount,
    getActiveOrdersCountWithCompleted,
    getTotalStops,
    getTotalDuration,
    getTotalDistance,
    createSocketAndListen,
    listenForOrdersFromSocket,
    createNewOrderLocalNotificationObject,
    totalCash,
};
