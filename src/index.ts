/* eslint-disable import/no-nodejs-modules */
/* eslint-disable no-console */

import { C9API } from "./c9/api";
import { createC9Http } from "./c9/http";
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

// Polyfills for node
global.fetch = require('node-fetch-polyfill');
global.crypto = require('@trust/webcrypto');

const keys = fs.readJSONSync(path.join(os.homedir(), '.c9.json'));

const http = createC9Http(keys.management.apiKey, keys.management.apiSecret);
const api = new C9API(http);

async function main() {
    const user = await api.getUserByUserName('johanblumenberg');
    console.log(user);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
