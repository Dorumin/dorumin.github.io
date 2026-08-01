import { browser } from "$app/environment";
import { writable, type Subscriber, type Unsubscriber, type Updater, type Writable, type StartStopNotifier, get } from "svelte/store";

type StoreContract<T> = {
    subscribe(this: void, run: Subscriber<T>): Unsubscriber;
    set(this: void, value: T): void;
    update(this: void, updater: Updater<T>): void;

    init: StartStopNotifier<T>;
}

export function proxyStore<T>(initialValue: T, init: (source: Writable<T>) => StoreContract<T>) {
    const source = writable<T>(initialValue, (...args) => {
        return methods.init(...args);
    });
    const methods = init(source);

    return {
        ...source,
        ...methods
    };
}

export const localStorageBacked = function<T>(key: string, initial: T) {
    return proxyStore(initial, source => {
        return {
            set(newValue) {
                if (browser) { localStorage.setItem(key, JSON.stringify(newValue)); }
                return source.set(newValue);
            },
            update(updater) {
                if (browser) { localStorage.setItem(key, JSON.stringify(source)); }
                return source.update(updater);
            },
            subscribe: (callback) => source.subscribe(callback),
            init: (set) => {
                if (!browser) return;

                let stored = localStorage.getItem(key);

                if (stored === null) {
                    set(initial);
                } else {
                    set(JSON.parse(stored));
                }
            }
        };
    });
};

const centralizedKey = 'amongus';

export const localStorageCentralized = function<T>(localKey: string, initial: T) {
    let data: Record<string, any> = {};

    const stored = localStorage.getItem(centralizedKey);
    if (stored !== null) {
        data = JSON.parse(stored);
    }

    data[localKey] = initial;

    return proxyStore(initial, source => {
        return {
            set(newValue) {
                data[localKey] = newValue;
                if (browser) { localStorage.setItem(centralizedKey, JSON.stringify(data)); }
                return source.set(newValue);
            },
            update(updater) {
                data[localKey] = updater(get(source));
                if (browser) { localStorage.setItem(centralizedKey, JSON.stringify(data)); }
                return source.update(updater);
            },
            subscribe: (callback) => source.subscribe(callback),
            init: (set) => {
                set(data[localKey]);
            }
        };
    });
};
