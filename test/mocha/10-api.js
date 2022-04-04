/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {
  getAppIdentity,
  getServiceIdentities,
  _resetApplicationIdentity,
  _generateApplicationIdentity,
  _generateServiceIdentity
} from '@bedrock/app-identity';

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
  it('throws error when attempting to configure app identity again',
    async () => {
      const {seeds} = bedrock.config['app-identity'];
      let err;
      let res;
      try {
        res = await _generateApplicationIdentity({seedDescription: seeds.app});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('DuplicateError');
      err.message.should.equal(
        'Application identity was previously configured.');
    });
  it('throws error if service identity name was previously configured',
    async () => {
      let err;
      let res;
      try {
        // set service name to `test` which has already been configured
        res = await _generateServiceIdentity({name: 'test'});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('DuplicateError');
      err.message.should.equal(
        'Service identity (test) was previously configured.');
    });
  it('throws error if the generated application ID does not match the ID found',
    async () => {
      _resetApplicationIdentity();

      const seedDescription = {
        id: 'did:key:z6MkmXjRf7pMCH8ct1ekbdqFMEcak1zDJTR31gXDokDhA69h',
        // this seed will generate an unmatching application ID
        seedMultibase: 'z1AdmTr7Z4fr6nBMH634Uti7tgQmHaCvMmKwJ9bo9yBhz1q'
      };
      let err;
      let res;
      try {
        res = await _generateApplicationIdentity(
          {name: 'test', seedDescription});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('InvalidStateError');
      err.message.should.equal(
        'The generated application ID does not match the ID found in the ' +
        'identity\'s description.');
      err.details.identityName.should.equal('test');
      err.details.expectedId.should.equal(
        'did:key:z6MkmXjRf7pMCH8ct1ekbdqFMEcak1zDJTR31gXDokDhA69h');
      err.details.actualId.should.equal(
        'did:key:z6Mki1LV6wD9z7BhsmJsVBPuQnxLB4pZRsfrSinD4qmG8UNL');
    });
  it('throws error if the generated service ID does not match the ID found',
    async () => {
      const seedDescription = {
        id: 'did:key:z6MkqazfWvQjrKJxu7caQsrz7gbg1sPzY6B2GtyPkrhdXekf',
        // this seed will generate an unmatching service ID
        seedMultibase: 'z1AhhfKGoQWcmFT5T4CqK78tUBFZqtGYThdxd5EZESgwCqD'
      };
      _resetApplicationIdentity();
      let err;
      let res;
      try {
        res = await _generateServiceIdentity({name: 'test2', seedDescription});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('InvalidStateError');
      err.message.should.equal(
        'The generated service id does not match the id found in the ' +
        'service identity\'s description.');
      err.details.seedName.should.equal('test2');
      err.details.seedDescriptionId.should.equal(
        'did:key:z6MkqazfWvQjrKJxu7caQsrz7gbg1sPzY6B2GtyPkrhdXekf');
      err.details.generatedKeyId.should.equal(
        'did:key:z6Mks7oWc1GaYXiXgCf9GXeUYVFiYC5JFQmnnnk5N7Vvfmhf');
    });
  it('throws error if "serviceType" is missing for service identity',
    async () => {
      const seedDescription = {
        id: 'did:key:z6MknnVVvr8HRx2FZcm3r8dEFmJPV3NgKLYBf9omS5zxbDrZ',
        seedMultibase: 'z1AjQcbsw5XA7emiBaLUuMusTowm3M7tjA3Yt1ZoqEg9Dwj'
      };
      _resetApplicationIdentity();
      let err;
      let res;
      try {
        res = await _generateServiceIdentity({name: 'test2', seedDescription});
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('InvalidStateError');
      err.message.should.equal(
        'Missing "serviceType" for service identity [test2].');
    });
  it('throws error if "APPLICATION_IDENTITY" is undefined',
    async () => {
      // Set APPLICATION_IDENTITY to undefined
      _resetApplicationIdentity();
      let err;
      let res;
      try {
        res = getAppIdentity();
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('NotFoundError');
      err.message.should.equal('Application identity not found.');
    });
});
