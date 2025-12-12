/*!
 * Copyright (c) 2020-2025 Digital Bazaar, Inc. All rights reserved.
 */
export {getAppIdentity, getServiceIdentities} from './identity.js';
export {zcapClient} from './zcapClient.js';

// currently exported for internal use only
export {
  _generateApplicationIdentity,
  _generateServiceIdentity,
  _resetApplicationIdentity
} from './identity.js';
