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

let _keys = null;

export const keys = new Proxy({}, {
  get(target, propKey) {
    if(!_keys) {
      throw _invalidStateError();
    }
    return _keys[propKey];
  },
  getPrototypeOf() {
    if(!_keys) {
      throw _invalidStateError();
    }
    return Object.getPrototypeOf(_keys);
  },
  getOwnPropertyDescriptor(target, prop) {
    if(!_keys) {
      throw _invalidStateError();
    }
    return Object.getOwnPropertyDescriptor(_keys, prop);
  },
  set(target, prop, value) {
    if(!_keys) {
      throw _invalidStateError();
    }
    _keys[prop] = value;
    return true;
  }
});

bedrock.events.on('bedrock.init', async () => {
  const {seedBase58} = config['app-key'];

  if(!seedBase58) {
    throw new BedrockError(
      'Application key seed is not set.', 'InvalidStateError');
  }

  // convert base58 to Uint8Array
  const seed = decode(seedBase58);

  // inialize key after bedrock configuration stage is complete
  const didKey = await didKeyDriver.generate({seed});

  const {didDocument: {
    capabilityDelegation, capabilityInvocation, keyAgreement, id
  }} = didKey;

  logger.info(`application key: ${id}`);

  const capabilityDelegationKey = didKey.keyPairs.get(capabilityDelegation[0]);
  const capabilityInvocationKey = didKey.keyPairs.get(capabilityInvocation[0]);
  const keyAgreementKey = didKey.keyPairs.get(keyAgreement[0].id);

  _keys = {capabilityDelegationKey, capabilityInvocationKey, keyAgreementKey};
});

function _invalidStateError() {
  return new BedrockError('The app key is not ready.', 'InvalidStateError');
}
