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
    seedBase58: 'AKXkfGfos4k2KEx5iXunVJfXmM9kzT1H6eDaVdBRHCTt'
  },
  services: {
    test: {
      id: 'did:key:z6MkwQfUzcoF4zpUPGo629xyZiQZahsZjRz5qaqMaD5GjwnQ',
      seedBase58: 'AKXkfGfos4k2KEx5iXunVJfXmM9kzT1H6eDaVdBRHCTt',
      serviceType: 'test'
    }
  }
};
