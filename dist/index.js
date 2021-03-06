"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const types = require("./types");
class Cache {
    constructor(options) {
        this._store = null;
        options = options || {};
        options.storeType = options.storeType || 'local';
        this.init(options);
    }
    async init(options) {
        let module = null;
        switch (options.storeType) {
            case types.StoreType[types.StoreType.local]:
                module = await Promise.resolve().then(() => require('./store/Local'));
                break;
            case types.StoreType[types.StoreType.redis]:
                module = await Promise.resolve().then(() => require('./store/Redis'));
                break;
            case types.StoreType[types.StoreType.memcache]:
                module = await Promise.resolve().then(() => require('./store/Memcache'));
                break;
        }
        this._store = new module.default();
        this._store.valueFunction = options.valueFunction || null;
        this._store.expire = options.expire || null;
        this._store.timeoutCallback = options.timeoutCallback || null;
        this._store.limit = options.limit || null;
        this._store.valueType = options.valueType || null;
    }
    async get(key) {
        return this._store.get(key);
    }
    async put(key, val, expire, timeoutCallback) {
        return this._store.put(key, val, expire, timeoutCallback);
    }
    async del(key) {
        return await this._store.del(key);
    }
    clear() {
        this._store.clear();
    }
    async size() {
        return this._store.size();
    }
    async keys() {
        return this._store.keys();
    }
    async forEach(func) {
        let that = this;
        let keys = await this.keys();
        keys.forEach(async (val) => {
            await func(val, that);
        });
    }
}
exports.Cache = Cache;
//# sourceMappingURL=index.js.map