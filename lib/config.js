/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import bedrock from 'bedrock';
const {config} = bedrock;

const namespace = 'app-key';
const cfg = config[namespace] = {};

cfg.seedBase58 = null;

// changes to these fields will be required in some deployment environments
// this helps to ensure that development values are not used in production
config.ensureConfigOverride.fields.push(
  `${namespace}.seedBase58`,
);
