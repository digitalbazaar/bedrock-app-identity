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

const APPLICATION_KEYS = new Map();

export default APPLICATION_KEYS;

bedrock.events.on('bedrock.init', async () => {
  const {seeds} = config['app-key'];

  if(!seeds) {
    throw new BedrockError(
      'Application key seed(s) not set.', 'InvalidStateError');
  }

  await _generateApplicationKey({name: 'app', seed: seeds.app})
  logger.info(`Application key seed [app]: ${seeds.app.id}`);

  if(seeds.services) {
    for(const name of Object.keys(seeds.services)) {
      await _generateApplicationKey({
        name: name,
        seed: seeds.services[name]
      });

      logger.info(`Application key seed [${name}]: ${seeds.services[name].id}`);
    }
  }
});

async function _generateApplicationKey({name, seed}) {
  const {id, ...keys} = await _generateKeys({seedBase58: seed.seedBase58});

  if(id !== seed.id) {
    const msg = `Application key "${name}" seed does not match its id.`;
    throw new BedrockError(msg, 'InvalidStateError', {
      providedId: seed.id,
      generatedId: id
    });
  }

  if(APPLICATION_KEYS.has(name)) {
    const msg = `Application key "${name}" seed was previously configured.`;
    throw new BedrockError(msg, 'DuplicateError');
  }

  APPLICATION_KEYS.set(name, keys)
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
    authenticationKey,
    assertionMethodKey,
    capabilityDelegationKey,
    capabilityInvocationKey,
    keyAgreementKey
  };
}

function _invalidStateError() {
  return new BedrockError('The app key is not ready.', 'InvalidStateError');
}
