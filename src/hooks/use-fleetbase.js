import Fleetbase from '@fleetbase/sdk';
import config from 'config';

const { FLEETBASE_KEY, FLEETBASE_HOST } = config;
let fleetbase, adapter;

try {
    // fleetbase = new Fleetbase(FLEETBASE_KEY, { host: 'http://192.168.31.211:8000' });
    fleetbase = new Fleetbase('flb_live_dnIMfOTpfOSjhpiXCmi3', { host: 'https://fleetbase-api.katchkw.com' });
    adapter = fleetbase.getAdapter();
} catch (error) {
    fleetbase = error;
}

const useFleetbase = () => {
    return fleetbase;
};

export default useFleetbase;
export { adapter };
