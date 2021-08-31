import { addBaseUrl, createHttp, HttpChain, HttpOptions, HttpResponse } from '@symphony/rtc-http';
import * as uuid from 'uuid';

class C9Auth implements HttpChain {
    private _key: Promise<CryptoKey>;

    constructor(
        private _chain: HttpChain,
        private _apiKey: string,
        apiSecret: string,
    ) {
        this._key = crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(apiSecret),
            { name: 'HMAC', hash: { name: 'SHA-512' } },
            false,
            ['sign'],
        );
    }

    private _getKey() {
        return this._key;
    }

    private async _auth(method: string, url: string, contentType: string | undefined, content: string | undefined) {
        const nonce = uuid.v4();
        const requestTimestamp = new Date().toUTCString();
        const u = new URL(url);

        let data = [
            method,
            u.protocol.replace(':', ''),
            u.hostname + ':' + (u.port || 443),
            u.pathname,
            contentType ? contentType.split(';')[0] : '',
            this._apiKey,
            nonce,
            requestTimestamp,
            content ?? '',
            '',
        ];

        const key = await this._getKey();
        const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data.join('\n')));
        const signatureString = btoa(String.fromCharCode(...new Uint8Array(signature)));

        return {
            'Date': requestTimestamp,
            'Authorization': `HmacSHA512 ${this._apiKey}:${nonce}:${signatureString}`,
        };
    }

    public async request<ResponseBody>(method: string, url: string, contentType: string | undefined, content: string | undefined, opts: HttpOptions): Promise<HttpResponse<ResponseBody>> {
        const _opts = {
            ...opts,
            headers: {
                ...opts.headers,
                ...await this._auth(method, url, contentType, content),
            },
        };
        return this._chain.request(method, url, contentType, content, _opts);
    }
}

export function createC9Http(
    apiKey: string,
    apiSecret: string,
) {
    return createHttp({ cache: 'no-cache', mode: 'no-cors', credentials: 'omit' })
        .chain(chain => new C9Auth(chain, apiKey, apiSecret))
        .chain(addBaseUrl('https://managementapi.prod1.xhoot.com:443/external/apis'));
}
