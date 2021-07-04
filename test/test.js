/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');
require('bedrock-express');
require('bedrock-mongodb');

const {meters} = require('bedrock-meter');

bedrock.events.on('bedrock.init', async () => {
  /* Handlers need to be added before `bedrock.start` is called. The empty
  handlers that are added here will be replaced within tests. */
  meters.setInsertHandler({handler: () => {}});
  meters.setRemoveHandler({handler: () => {}});
  meters.setUseHandler({handler: () => {}});
  console.log('things set');
});

require('bedrock-test');
bedrock.start();
