/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
import {decode} from 'base58-universal';
import {driver} from '@digitalbazaar/did-method-key';
import logger from './logger.js';

import './config.js';

const {config, util: {BedrockError}} = bedrock;
const didKeyDriver = driver();

// multibase base58-btc header
const MULTIBASE_BASE58BTC_HEADER = 'z';
// multihash identity function cdoe
const MULTIHASH_IDENTITY_FUNCTION_CODE = 0x00;
// seed byte size
const SEED_BYTE_SIZE = 32;

let APPLICATION_IDENTITY;
const SERVICE_IDENTITIES = new Map();

export function getAppIdentity() {
  if(!APPLICATION_IDENTITY) {
    throw new BedrockError('Application identity not found.', 'NotFoundError');
  }
  return {...APPLICATION_IDENTITY};
}

export function getServiceIdentities() {
  return new Map(SERVICE_IDENTITIES);
}

bedrock.events.on('bedrock.init', async () => {
  const {seeds} = config['app-identity'];

  if(!seeds) {
    throw new BedrockError('Identity seed(s) not set.', 'InvalidStateError');
  }

  if(seeds.app) {
    await _generateApplicationIdentity({seedDescription: seeds.app});
    const {id} = seeds.app;
    const identity = {name: 'app', id};
    logger.debug('Application identity created.', {identity});
  } else {
    const identity = {name: 'app'};
    logger.debug('Application identity not created.', {identity});
  }

  if(!seeds.services) {
    logger.debug('Service identity seeds not found.');
    return;
  }

  for(const [name, seedDescription] of Object.entries(seeds.services)) {
    // any error thrown here should not be caught, we want startup to fail
    await _generateServiceIdentity({name, seedDescription});
    const {id} = seeds.app;
    logger.debug('Service identity created.', {identity: {name, id}});
  }
});

async function _generateApplicationIdentity({name, seedDescription}) {
  if(APPLICATION_IDENTITY) {
    throw new BedrockError(
      `Application identity was previously configured.`,
      'DuplicateError');
  }

  const {seedMultibase} = seedDescription;
  const {id, keys} = await _generateKeys({seedMultibase});

  if(id !== seedDescription.id) {
    const msg = 'The generated application ID does not match the ID found ' +
      `in the identity's description.`;
    throw new BedrockError(msg, 'InvalidStateError', {
      identityName: name,
      expectedId: seedDescription.id,
      actualId: id
    });
  }

  APPLICATION_IDENTITY = {
    id,
    keys
  };
}

async function _generateServiceIdentity({name, seedDescription}) {
  if(SERVICE_IDENTITIES.has(name)) {
    throw new BedrockError(
      `Service identity (${name}) was previously configured.`,
      'DuplicateError');
  }

  const {seedMultibase} = seedDescription;
  const {id, keys} = await _generateKeys({seedMultibase});

  if(id !== seedDescription.id) {
    const msg = 'The generated service id does not match the id found ' +
      `in the service identity's description.`;
    throw new BedrockError(msg, 'InvalidStateError', {
      seedName: name,
      seedDescriptionId: seedDescription.id,
      generatedKeyId: id
    });
  }

  const {serviceType} = seedDescription;
  if(!serviceType) {
    const msg = `Missing "serviceType" for service identity [${name}].`;
    throw new BedrockError(msg, 'InvalidStateError');
  }

  const serviceIdentity = {
    id,
    keys,
    serviceType
  };

  SERVICE_IDENTITIES.set(name, serviceIdentity);
}

async function _generateKeys({seedMultibase}) {
  // convert multibase seed to Uint8Array
  const seed = _decodeMultibaseSeed({seedMultibase});

  // inialize key after bedrock configuration stage is complete
  const didKey = await didKeyDriver.generate({seed});

  const {didDocument: {
    authentication, assertionMethod, capabilityDelegation, capabilityInvocation,
    keyAgreement, id
  }} = didKey;

  const authenticationKey = didKey.keyPairs.get(authentication[0]);
  const assertionMethodKey = didKey.keyPairs.get(assertionMethod[0]);
  const capabilityDelegationKey = didKey.keyPairs.get(capabilityDelegation[0]);
  const capabilityInvocationKey = didKey.keyPairs.get(capabilityInvocation[0]);
  const keyAgreementKey = didKey.keyPairs.get(keyAgreement[0].id);

  return {
    id,
    keys: {
      authenticationKey,
      assertionMethodKey,
      capabilityDelegationKey,
      capabilityInvocationKey,
      keyAgreementKey
    }
  };
}

function _decodeMultibaseSeed({seedMultibase}) {
  const prefix = seedMultibase[0];
  if(prefix !== MULTIBASE_BASE58BTC_HEADER) {
    throw new Error('Unsupported multibase encoding.');
  }
  const data = seedMultibase.substring(1);
  // <varint hash fn code> <varint digest size in bytes> <hash fn output>
  //  <identity function>              <32>                <seed bytes>
  const seedMultihash = decode(data);
  // <varint hash fn code>: identity function
  const [hashFnCode] = seedMultihash.slice(0, 1);
  if(hashFnCode !== MULTIHASH_IDENTITY_FUNCTION_CODE) {
    throw new Error('Invalid multihash function code.');
  }
  // <varint digest size in bytes>: 32
  const [digestSize] = seedMultihash.slice(1, 2);
  if(digestSize !== SEED_BYTE_SIZE) {
    throw new Error('Invalid digest size.');
  }
  // <hash fn output>: seed bytes
  const seedBytes = seedMultihash.slice(2, seedMultihash.length);
  if(seedBytes.byteLength !== SEED_BYTE_SIZE) {
    throw new Error('Invalid digest.');
  }

  return seedBytes;
}
