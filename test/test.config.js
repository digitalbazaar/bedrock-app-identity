/*
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');
const path = require('path');

config.mocha.tests.push(path.join(__dirname, 'mocha'));

config['app-identity'].seeds = {
  app: {
    id: 'did:key:z6MkwQfUzcoF4zpUPGo629xyZiQZahsZjRz5qaqMaD5GjwnQ',
    seedMultibase: 'z1AfffcYWj1GaLcZt1Sz9bGgNLDm9k6q7GJaGjz36qyogLi'
  },
  services: {
    test: {
      id: 'did:key:z6MkwQfUzcoF4zpUPGo629xyZiQZahsZjRz5qaqMaD5GjwnQ',
      seedMultibase: 'z1AfffcYWj1GaLcZt1Sz9bGgNLDm9k6q7GJaGjz36qyogLi',
      serviceType: 'test'
    }
  }
};
