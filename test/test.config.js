/*
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {config} = require('bedrock');
const path = require('path');

config.mocha.tests.push(path.join(__dirname, 'mocha'));

config['app-key'].seedBase58 = '65w4P2NYHPYFefB2Wq8gtdUbvbHQYrDLMkDgMmsbqkKX';
