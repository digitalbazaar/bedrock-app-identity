/*
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
const {getAppIdentity, getServiceIdentities} = require('bedrock-app-identity');

describe('bedrock-app-identity API', () => {
  it('getAppIdentity() has the proper exports', async () => {
    const {keys} = getAppIdentity();
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
  it('getServiceIdentities() has the proper exports', async () => {
    const serviceIdentities = getServiceIdentities();
    const {keys, serviceType} = serviceIdentities.get('test');
    serviceType.should.equal('test');
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
