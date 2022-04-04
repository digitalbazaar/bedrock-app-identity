/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';
import {fileURLToPath} from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
