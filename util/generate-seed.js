/*!
 * Copyright (c) 2020-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {decodeSecretKeySeed, generateSecretKeySeed} from 'bnid';
import {driver} from '@digitalbazaar/did-method-key';
import {generateSecretKeySeed, decodeSecretKeySeed} from 'bnid';

const didKeyDriver = driver();
didKeyDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519Multikey.from
});

// generate a random seed
const secretKeySeed = await generateSecretKeySeed();
const seedBytes = await decodeSecretKeySeed({secretKeySeed});

// generate `did:key` DID
const verificationKeyPair = await Ed25519Multikey.generate({seed: seedBytes});
const {didDocument} = await didKeyDriver.fromKeyPair({verificationKeyPair});

console.log('PUBLIC DID', didDocument.id);
console.log(`SECRET seedMultibase: ${secretKeySeed}`);
