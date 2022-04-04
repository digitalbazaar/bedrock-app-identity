/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

const namespace = 'app-identity';
const cfg = config[namespace] = {};

cfg.seeds = {
  app: {
    id: 'did:key:z6MksNZwi2r6Qxjt3MYLrrZ44gs2fauzgv1dk4E372bNVjtc',
    seedMultibase: 'z1AmMXgweztXscpTpxx19jsCLkPXUacTTBme2oxWGvuto9S'
  },
  services: {}
};

// changes to these fields will be required in some deployment environments
// this helps to ensure that development values are not used in production
config.ensureConfigOverride.fields.push(
  `${namespace}.seeds`,
);
