import * as redis from 'redis';
import StoreCallback from './StoreCallback';
interface IOption<K, V> {
    valueFunction?: StoreCallback<K, V>;
    expire?: number;
    timeoutCallback?: StoreCallback<K, V>;
    limit?: () => Promise<Boolean>;
    store?: {
        storeType?: string;
    } & redis.ClientOpts;
}
export default IOption;
