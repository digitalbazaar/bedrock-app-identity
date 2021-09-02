/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {encode} = require('base58-universal');
const {driver} = require('@digitalbazaar/did-method-key');
const {IdGenerator} = require('bnid');

// multibase base58-btc header
const MULTIBASE_BASE58BTC_HEADER = 'z';
// multihash identity function cdoe
const MULTIHASH_IDENTITY_FUNCTION_CODE = 0x00;
// seed byte size
const SEED_BYTE_SIZE = 32;
const SEED_BITS_SIZE = SEED_BYTE_SIZE * 8;

const didKeyDriver = driver();

// 256 bit (32 byte) random id generator
const generator = new IdGenerator({
  bitLength: SEED_BITS_SIZE
});

(async () => {
  // generate a random seed
  const seedBytes = await generator.generate();
  if(seedBytes.length !== SEED_BYTE_SIZE) {
    throw new Error('Generated seed does not match expected byte size.', {
      generatedSize: seedBytes.byteLength,
      expectedSize: SEED_BYTE_SIZE
    });
  }

  // <varint hash fn code> <varint digest size in bytes> <hash fn output>
  //  <identity function>              <32>                <seed bytes>
  const seedMultihash = new Uint8Array(2 + SEED_BYTE_SIZE);
  // <varint hash fn code>: identity function
  seedMultihash.set([MULTIHASH_IDENTITY_FUNCTION_CODE]);
  // <varint digest size in bytes>: 32
  seedMultihash.set([SEED_BYTE_SIZE], 1);
  // <hash fn output>: seed bytes
  seedMultihash.set(seedBytes, 2);

  const seedMultibase = MULTIBASE_BASE58BTC_HEADER + encode(seedMultihash);
  const didKey = await didKeyDriver.generate({seed: seedBytes});
  console.log('PUBLIC DID', didKey.didDocument.id);
  console.log(`SECRET seedMultibase: ${seedMultibase}`);
})();
