// import * as redis from 'redis';

import IStore from './IStore';
import * as types from '../types';
import * as utils from '@inheap/utils';

export default class Redis<K, V> extends IStore<K, V> {
	private keyPrefix: string = null;
	// private client: redis.RedisClient = null;
	private client = null;

	constructor(option) {
		super();
		option.host = option.host || 'localhost';
		option.port = option.port || 6379;
		option.prefix = option.prefix || 'cache' + (Math.random() * 1000).toFixed(0);
		this.keyPrefix = '-keys';

		this.init(option);
	}

	async init(option) {
		// @ts-ignore
		let redis = await import('redis');
		this.client = redis.createClient(option);
	}

	async get(key: K): Promise<V> {
		let json = await new Promise<string>((res, rej) => {
			this.client.get(this.keyCode(key), (err, data) => {
				if (err) { rej(err); }
				else { res(data); }
			});
		})
		let result = null;
		if (json) {
			if (this.valueType) {
				let obj = JSON.parse(json);
				result = utils.objectParse(obj, this.valueType);
			} else {
				result = JSON.parse(json);
			}
		}
		if (result == null && this.valueFunction) {
			result = await this.valueFunction(key);
			if (result != null) {
				this.put(key, result, this.expire, this.timeoutCallback);
			}
		}
		return result;
	}

	async put(key: K, val: V, expire?: number, timeoutCallback?: types.StoreCallback<K, V>): Promise<boolean> {
		try {
			if (expire && !(typeof expire == 'number' || !isNaN(expire) || expire <= 0)) {
				throw new Error('timeout is not a number or less then 0');
			}

			if (timeoutCallback && typeof timeoutCallback !== 'function') {
				throw new Error('Cache timeout callback must be a function');
			}

			if (val == null) {
				throw new Error('Value cannot be a null');
			}

			let objJson = JSON.stringify(val);

			await new Promise<any>((res, rej) => {
				this.client.set(this.keyCode(key), objJson, (err, data) => {
					if (err) { rej(err); }
					else { res(data); }
				});
			});
			if (this.expire) {
				this.client.expire(this.keyCode(key), (this.expire / 1000));
			}

			// Removing Overlimit element
			await new Promise<any>((res, rej) => {
				this.client.lpush(this.keyPrefix, this.keyCode(key), (err, data) => {
					if (err) { rej(err); }
					else { res(data); }
				});
			})

			if (this.limit && typeof this.limit == 'function') {
				while (await this.limit()) {
					let firstKey = await new Promise<string>((res, rej) => {
						this.client.lpop(this.keyPrefix, (err, data) => {
							if (err) { rej(err); }
							else { res(data); }
						});
					});
					this.client.del(firstKey);
				}
			}
			return true;
		} catch (error) {
			console.log(error);
			return false;
		}
	}

	async del(key: K): Promise<boolean> {
		if (!key) {
			return false;
		}
		let hashKey = this.keyCode(key);
		await new Promise<any>((res, rej) => {
			this.client.lrem(this.keyPrefix, 0, hashKey, (err, data) => {
				if (err) { rej(err); }
				else { res(data); }
			});
		});
		return this.client.del(hashKey);
	}

	async clear(): Promise<void> {
		let keys = await new Promise<Array<string>>((res, rej) => {
			this.client.lrange(this.keyPrefix, 0, -1, (err, data) => {
				if (err) { rej(err); }
				else { res(data); }
			});
		});
		for (let key of keys) {
			this.client.del(key);
		}
	}

	async size(): Promise<number> {
		return await new Promise<number>((res, rej) => {
			this.client.llen(this.keyPrefix, (err, data) => {
				if (err) { rej(err); }
				else { res(data); }
			});
		});
	}

	async keys(): Promise<Array<K>> {
		return null;
	}
}