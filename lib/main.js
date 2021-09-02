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
  const {seeds} = config['app-key'];

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

  for(const name of Object.keys(seeds.services)) {
    const seedDescription = seeds.services[name];
    // any error thrown here should not be caught, we want startup to fail
    await _generateServiceIdentity({name, seedDescription});
    const {id} = seeds.app;
    logger.debug('Service identity created.', {key: {name, id}});
  }
});

async function _generateApplicationIdentity({name, seedDescription}) {
  const {seedBase58} = seedDescription;
  const {id, keys} = await _generateKeys({seedBase58});

  if(id !== seedDescription.id) {
    const msg = 'The generated application id does not match the id found ' +
      `in the identity's description.`;
    throw new BedrockError(msg, 'InvalidStateError', {
      identityName: name,
      identityId: seedDescription.id,
      generatedKeyId: id
    });
  }

  if(APPLICATION_IDENTITY) {
    throw new BedrockError(
      `Application identity was previously configured.`,
      'DuplicateError');
  }

  APPLICATION_IDENTITY = {
    id,
    keys
  };
}

async function _generateServiceIdentity({name, seedDescription}) {
  const {seedBase58} = seedDescription;
  const {id, keys} = await _generateKeys({seedBase58});

  if(id !== seedDescription.id) {
    const msg = 'The generated service id does not match the id found ' +
      `in the service identity's description.`;
    throw new BedrockError(msg, 'InvalidStateError', {
      seedName: name,
      seedDescriptionId: seedDescription.id,
      generatedKeyId: id
    });
  }

  if(SERVICE_IDENTITIES.has(name)) {
    throw new BedrockError(
      `Service identity [${name}] was previously configured.`,
      'DuplicateError');
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

async function _generateKeys({seedBase58}) {
  // convert base58 to Uint8Array
  const seed = decode(seedBase58);

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
