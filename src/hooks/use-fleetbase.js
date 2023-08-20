import Fleetbase from '@fleetbase/sdk';
import config from 'config';

const { FLEETBASE_KEY, FLEETBASE_HOST } = config;
let fleetbase, adapter;

try {
    fleetbase = new Fleetbase('flb_live_ngH0cOSdhyh1sBt4c0Hm', { host: 'https://api.fleetbase.io' });
    // fleetbase = new Fleetbase(FLEETBASE_KEY, { host: 'http://192.168.31.211:8000' });
    adapter = fleetbase.getAdapter();
    console.log("🚀 ~ file: use-fleetbase.js:9 ~ fleetbase:", fleetbase)
    console.log("🚀 ~ file: use-fleetbase.js:10 ~ adapter:", adapter)
} catch (error) {
    console.log("🚀 ~ file: use-fleetbase.js:11 ~ error:", error)
    fleetbase = error;
}

const useFleetbase = () => {
    return fleetbase;
};

export default useFleetbase;
export { adapter };
