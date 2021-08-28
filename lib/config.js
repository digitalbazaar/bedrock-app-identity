/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
const {config} = bedrock;

const namespace = 'app-key';
const cfg = config[namespace] = {};

cfg.seeds = {
  app: {
    id: 'did:key:z6MksNZwi2r6Qxjt3MYLrrZ44gs2fauzgv1dk4E372bNVjtc',
    seedBase58: 'G1Pq4Qwh8N2EDBuajY4P1H5hXfzGcnvkAQHYxoGMNKGc'
  },
  services: {
    kms: {
      id: 'did:key:z6MksNZwi2r6Qxjt3MYLrrZ44gs2fauzgv1dk4E372bNVjtc',
      seedBase58: 'G1Pq4Qwh8N2EDBuajY4P1H5hXfzGcnvkAQHYxoGMNKGc'
    },
    edv: {
      id: 'did:key:z6MksNZwi2r6Qxjt3MYLrrZ44gs2fauzgv1dk4E372bNVjtc',
      seedBase58: 'G1Pq4Qwh8N2EDBuajY4P1H5hXfzGcnvkAQHYxoGMNKGc'
    },
  }
};

// changes to these fields will be required in some deployment environments
// this helps to ensure that development values are not used in production
config.ensureConfigOverride.fields.push(
  `${namespace}.seeds`,
);
