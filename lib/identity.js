/*!
 * Copyright (c) 2020-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {decodeSecretKeySeed} from 'bnid';
import {driver} from '@digitalbazaar/did-method-key';
import {logger} from './logger.js';
import {
  X25519KeyAgreementKey2020
} from '@digitalbazaar/x25519-key-agreement-key-2020';

import './config.js';

const {config, util: {BedrockError}} = bedrock;

const didKeyDriver = driver();
didKeyDriver.use({
  multibaseMultikeyHeader: 'z6Mk',
  fromMultibase: Ed25519Multikey.from
});
didKeyDriver.use({
  multibaseMultikeyHeader: 'z6LS',
  fromMultibase: X25519KeyAgreementKey2020.from
});

let APPLICATION_IDENTITY;
const SERVICE_IDENTITIES = new Map();

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

export function getAppIdentity() {
  if(!APPLICATION_IDENTITY) {
    throw new BedrockError('Application identity not found.', 'NotFoundError');
  }
  return {...APPLICATION_IDENTITY};
}

export function getServiceIdentities() {
  return new Map(SERVICE_IDENTITIES);
}

// exported for internal use only
export async function _generateApplicationIdentity({name, seedDescription}) {
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

// exported for internal use only
export async function _generateServiceIdentity({name, seedDescription}) {
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
  const seed = decodeSecretKeySeed({secretKeySeed: seedMultibase});

  // initialize `did:key` DID after bedrock configuration stage is complete
  const verificationKeyPair = await Ed25519Multikey.generate({seed});
  const {
    didDocument: {id}, methodFor
  } = await didKeyDriver.fromKeyPair({verificationKeyPair});

  // update verification key pair with `id` and `controller`
  verificationKeyPair.id = methodFor({purpose: 'authentication'}).id;
  verificationKeyPair.controller = id;
  // for backwards compatibility, use legacy type `Ed25519VerificationKey2020`;
  // to be replaced with `Multikey` in next major release
  verificationKeyPair.type = 'Ed25519VerificationKey2020';

  // for backwards compatibility, import key agreement key; to be removed
  // in next major release
  const keyAgreementKey = X25519KeyAgreementKey2020
    .fromEd25519VerificationKey2020({
      keyPair: {
        ...verificationKeyPair,
        privateKeyMultibase: verificationKeyPair.secretKeyMultibase
      }
    });
  keyAgreementKey.id = `${id}#${keyAgreementKey.publicKeyMultibase}`;

  return {
    id,
    keys: {
      authenticationKey: verificationKeyPair,
      assertionMethodKey: verificationKeyPair,
      capabilityDelegationKey: verificationKeyPair,
      capabilityInvocationKey: verificationKeyPair,
      keyAgreementKey
    }
  };
}

// exported for internal use only
export function _resetApplicationIdentity() {
  APPLICATION_IDENTITY = undefined;
}
