/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {decode} = require('base58-universal');
const {driver} = require('@digitalbazaar/did-method-key');
const {generateId} = require('bnid');

const didKeyDriver = driver();

(async () => {
  const seedBase58 = await generateId({bitLength: 256, multibase: false});
  console.log(`SECRET seedBase58: ${seedBase58}`);
  // convert base58 to Uint8Array
  const seed = decode(seedBase58);
  const didKey = await didKeyDriver.generate({seed});
  console.log('PUBLIC DID', didKey.didDocument.id);
})();
