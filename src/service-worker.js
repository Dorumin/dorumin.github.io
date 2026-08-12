/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const ASSETS = [
    ...build, // the app itself
    ...files, // everything in `static`
];

// Endpoint the /progressive page fetches to emulate a network that never
// finishes; this worker serves it from a blob the page stored in IndexedDB.
const IMG_ENDPOINT_PATH = '/progressive/img';

const DB_NAME = 'progressive-img';
const STORE = 'blobs';

self.addEventListener('install', (event) => {
    // Pre-cache the app shell. Files are cached one by one so a single
    // missing/flaky asset can't reject the whole install: cache.addAll is
    // all-or-nothing and would leave the worker stuck in "installing".
    // Failures are logged and skipped, then served from the network.
    async function addFilesToCache() {
        const cache = await caches.open(CACHE);

        await Promise.allSettled(
            ASSETS.map(async (url) => {
                try {
                    await cache.add(url);
                } catch (err) {
                    console.error(`[service-worker] failed to precache ${url}`, err);
                }
            }),
        );
    }

    event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
    // Remove previous cached data from disk
    async function deleteOldCaches() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }
    }

    // Take control of open pages so the progressive endpoint is intercepted
    // even on the very first visit, without needing a reload.
    event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Let the browser handle non-http(s) requests (e.g. chrome-extension://
    // subresources injected by extensions) natively; the Cache API can't
    // store them and we'd otherwise fail the request.
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    if (url.origin === location.origin && url.pathname === IMG_ENDPOINT_PATH) {
        event.respondWith(partialImgFetch(event.request));
        return;
    }

    // ignore POST requests etc
    if (event.request.method !== 'GET') return;

    async function respond() {
        const cache = await caches.open(CACHE);

        // `build`/`files` can always be served from the cache
        if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);

            if (response) {
                return response;
            }
        }

        // for everything else, try the network first, but
        // fall back to the cache if we're offline
        try {
            const response = await fetch(event.request);

            // if we're offline, fetch can return a value that is not a Response
            // instead of throwing - and we can't pass this non-Response to respondWith
            if (!(response instanceof Response)) {
                throw new Error('invalid response from fetch');
            }

            if (response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch (err) {
            const response = await cache.match(event.request);

            if (response) {
                return response;
            }

            // if there's no cache, then just error out
            // as there is nothing we can do to respond to this request
            throw err;
        }
    }

    event.respondWith(respond());
});

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function partialImgFetch(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const lengthParam = url.searchParams.get('length');

    if (!id) {
        return new Response('Missing id', { status: 400 });
    }

    if (!lengthParam) {
        return new Response('Missing length', { status: 400 });
    }

    const blob = await getBlob(id);

    if (!blob) {
        return new Response('Blob not found', { status: 404 });
    }

    const length = Number(lengthParam);
    const headers = {
        'Content-Type': blob.type,
        'Cache-Control': 'no-store',
    };

    if (length >= blob.size) {
        return new Response(blob, { headers });
    }

    return neverEndingResponse(blob.slice(0, length, blob.type), headers);
}

/**
 * @returns {Promise<IDBDatabase>}
 */
function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE, { keyPath: 'id' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * @param {string} id
 * @returns {Promise<Blob | null>}
 */
async function getBlob(id) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE, 'readonly');
        const request = transaction.objectStore(STORE).get(id);
        request.onsuccess = () => resolve(request.result?.blob ?? null);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delivers `blob`'s bytes and never closes the connection, emulating a
 * network that hangs forever after sending that much of the file.
 *
 * @param {Blob} blob
 * @param {HeadersInit} headers
 * @returns {Response}
 */
function neverEndingResponse(blob, headers) {
    const body = new ReadableStream({
        async start(controller) {
            const buffer = await blob.arrayBuffer();
            controller.enqueue(new Uint8Array(buffer));
        },
    });

    return new Response(body, { headers });
}
