/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');
require('bedrock-express');
require('bedrock-mongodb');

const {meters} = require('bedrock-meter');

// Handlers need to be added before bedrock.start called.
// Adding empty handlers here since test files are loaded too late.
bedrock.events.on('bedrock.init', async () => {
  meters.setHandler({name: 'insert', handler: () => {}});
  meters.setHandler({name: 'remove', handler: () => {}});
  meters.setHandler({name: 'use', handler: () => {}});
});

require('bedrock-test');
bedrock.start();
