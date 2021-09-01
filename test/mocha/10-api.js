/*
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
const {APPLICATION_KEYS} = require('bedrock-app-key');

describe('bedrock-app-key API', () => {
  it('has the proper exports', async () => {
    const keys = APPLICATION_KEYS.get('app');
    keys.should.have.keys([
      'authenticationKey', 'assertionMethodKey', 'capabilityDelegationKey',
      'capabilityInvocationKey', 'keyAgreementKey'
    ]);
    keys.capabilityDelegationKey.signer.should.be.a('function');
    keys.capabilityDelegationKey.type.should.equal(
      'Ed25519VerificationKey2020');
    keys.capabilityInvocationKey.signer.should.be.a('function');
    keys.capabilityInvocationKey.type.should.equal(
      'Ed25519VerificationKey2020');
    keys.keyAgreementKey.type.should.equal('X25519KeyAgreementKey2020');
  });
});
