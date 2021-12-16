/*
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
const {getAppIdentity, getServiceIdentities} = require('bedrock-app-identity');
const bedrock = require('bedrock');
const {_resetApplicationIdentity} = require('bedrock-app-identity');

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
      let err;
      let res;
      try {
        // this will trigger the bedrock.init event which will call
        // `_generateApplicationIdentity` and try to configure app identity
        // again
        res = await bedrock.events.emit('bedrock.init');
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('DuplicateError');
      err.message.should.equal(
        'Application identity was previously configured.');
    });
  it('throws error when identity seed(s) is not set', async () => {
    bedrock.config['app-identity'].seeds = undefined;
    let err;
    let res;
    try {
      res = await bedrock.events.emit('bedrock.init');
    } catch(e) {
      err = e;
    }
    should.exist(err);
    should.not.exist(res);
    err.name.should.equal('InvalidStateError');
    err.message.should.equal('Identity seed(s) not set.');
  });
  it('throws error if service identity name was previously configured',
    async () => {
      bedrock.config['app-identity'].seeds = {
        services: {
          // set service name to `test` which has already been configured
          test: {}
        }
      };
      let err;
      let res;
      try {
        res = await bedrock.events.emit('bedrock.init');
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('DuplicateError');
      err.message.should.equal(
        'Service identity (test) was previously configured.');
    });
  it('exits if service identity seeds is not found',
    async () => {
      bedrock.config['app-identity'].seeds = {};
      let err;
      let res;
      try {
        res = await bedrock.events.emit('bedrock.init');
      } catch(e) {
        err = e;
      }
      should.not.exist(err);
      should.not.exist(res);
    });
  it('throws error if the generated application ID does not match the ID found',
    async () => {
      bedrock.config['app-identity'].seeds = {
        app: {
          id: 'did:key:z6MkmXjRf7pMCH8ct1ekbdqFMEcak1zDJTR31gXDokDhA69h',
          seedMultibase: 'z1AdmTr7Z4fr6nBMH634Uti7tgQmHaCvMmKwJ9bo9yBhz1q'
        },
        services: {}
      };
      _resetApplicationIdentity();
      let err;
      let res;
      try {
        res = await bedrock.events.emit('bedrock.init');
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('InvalidStateError');
      err.message.should.equal(
        'The generated application ID does not match the ID found in the ' +
        'identity\'s description.');
    });
  it('throws error if the generated service id does not match the id found',
    async () => {
      bedrock.config['app-identity'].seeds = {
        app: {
          id: 'did:key:z6MkgiUPg8Afs3CJzkZpAidCA46FFC5DEGGSzK2UZ7gwxr6C',
          seedMultibase: 'z1AXnp3vMtxrFPV5aqdVA8R5KuSpUyfvhDRWpTMWm91by2p'
        },
        services: {
          test2: {
            id: 'did:key:z6MkqazfWvQjrKJxu7caQsrz7gbg1sPzY6B2GtyPkrhdXekf',
            seedMultibase: 'z1AhhfKGoQWcmFT5T4CqK78tUBFZqtGYThdxd5EZESgwCqD',
            serviceType: 'test2'
          }
        }
      };
      _resetApplicationIdentity();
      let err;
      let res;
      try {
        res = await bedrock.events.emit('bedrock.init');
      } catch(e) {
        err = e;
      }
      should.exist(err);
      should.not.exist(res);
      err.name.should.equal('InvalidStateError');
      err.message.should.equal(
        'The generated service id does not match the id found in the ' +
        'service identity\'s description.');
    });
  it('throws error if "serviceType" is missing for service identity',
    async () => {
      bedrock.config['app-identity'].seeds = {
        app: {
          id: 'did:key:z6MkgiUPg8Afs3CJzkZpAidCA46FFC5DEGGSzK2UZ7gwxr6C',
          seedMultibase: 'z1AXnp3vMtxrFPV5aqdVA8R5KuSpUyfvhDRWpTMWm91by2p'
        },
        services: {
          test2: {
            id: 'did:key:z6MknnVVvr8HRx2FZcm3r8dEFmJPV3NgKLYBf9omS5zxbDrZ',
            seedMultibase: 'z1AjQcbsw5XA7emiBaLUuMusTowm3M7tjA3Yt1ZoqEg9Dwj',
          }
        }
      };
      _resetApplicationIdentity();
      let err;
      let res;
      try {
        res = await bedrock.events.emit('bedrock.init');
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
