/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {driver} from '@digitalbazaar/did-method-key';
import {generateSecretKeySeed, decodeSecretKeySeed} from 'bnid';

const didKeyDriver = driver();

// generate a random seed
const secretKeySeed = await generateSecretKeySeed();
const seedBytes = await decodeSecretKeySeed({secretKeySeed});
const didKey = await didKeyDriver.generate({seed: seedBytes});

console.log('PUBLIC DID', didKey.didDocument.id);
console.log(`SECRET seedMultibase: ${secretKeySeed}`);
