/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {generateId} = require('bnid');

(async () => {
  const seed = await generateId({bitLength: 256, multibase: false});
  console.log(`SEED: ${seed}`);
})();
