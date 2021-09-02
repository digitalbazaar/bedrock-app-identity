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

export const APPLICATION_KEYS = new Map();
export default {APPLICATION_KEYS};

bedrock.events.on('bedrock.init', async () => {
  const {seeds} = config['app-key'];

  if(!seeds) {
    throw new BedrockError(
      'Application key seed(s) not set.', 'InvalidStateError');
  }

  if(seeds.app) {
    await _generateApplicationKey({name: 'app', seedDescription: seeds.app});
    const {id} = seeds.app;
    logger.debug('Application key created.', {key: {name: 'app', id}});
  } else {
    logger.debug('Application key not created.', {key: {name: 'app'}});
  }

  if(!seeds.services) {
    logger.debug('Application key seeds for services are not found.');
    return;
  }

  for(const name of Object.keys(seeds.services)) {
    const seedDescription = seeds.services[name];
    // any error thrown here should not be caught, we want startup to fail
    await _generateApplicationKey({name, seedDescription});
    const {id} = seeds.app;
    logger.debug('Application key created.', {key: {name, id}});
  }
});

async function _generateApplicationKey({name, seedDescription}) {
  const {seedBase58} = seedDescription;
  const applicationKeyConfig = await _generateApplicationKeyConfig({seedBase58});
  const {id} = applicationKeyConfig;

  if(id !== seedDescription.id) {
    const msg = 'The generated key id does not match the id found in the ' +
      `seed's description.`;
    throw new BedrockError(msg, 'InvalidStateError', {
      seedName: name,
      seedDescriptionId: seedDescription.id,
      generatedKeyId: id
    });
  }

  if(APPLICATION_KEYS.has(name)) {
    const msg = `Application key [${name}] seed was previously configured.`;
    throw new BedrockError(msg, 'DuplicateError');
  }

  // only set `serviceType` for application keys for services
  if(name !== 'app') {
    const {serviceType} = seedDescription;
    if(!serviceType) {
      const msg = `Missing "serviceType" for application key [${name}] ` +
        `seed description.`;
      throw new BedrockError(msg, 'InvalidStateError');
    }
    applicationKeyConfig.serviceType = seedDescription.serviceType;
  }

  APPLICATION_KEYS.set(name, applicationKeyConfig);
}

async function _generateApplicationKeyConfig({seedBase58}) {
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
