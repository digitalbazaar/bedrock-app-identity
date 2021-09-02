/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');

module.exports = bedrock.loggers.get('app').child('bedrock-app-identity');
