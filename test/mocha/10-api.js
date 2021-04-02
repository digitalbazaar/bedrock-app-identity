/*
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
const {keys: appKeys} = require('bedrock-app-key');

describe('bedrock-app-key API', () => {
  it('has the proper exports', async () => {
    appKeys.should.have.keys([
      'capabilityDelegationKey', 'capabilityInvocationKey', 'keyAgreementKey'
    ]);
    appKeys.capabilityDelegationKey.signer.should.be.a('function');
    appKeys.capabilityDelegationKey.type.should.equal(
      'Ed25519VerificationKey2020');
    appKeys.capabilityInvocationKey.signer.should.be.a('function');
    appKeys.capabilityInvocationKey.type.should.equal(
      'Ed25519VerificationKey2020');
    appKeys.keyAgreementKey.type.should.equal('X25519KeyAgreementKey2020');
  });
});
