/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const {meters} = require('bedrock-meter');
const database = require('bedrock-mongodb');

const HANDLER_COUNTS = {
  insert: 0,
  remove: 0,
  use: 0
};
exports.HANDLER_COUNTS = HANDLER_COUNTS;

exports.cleanDB = async () => {
  await database.collections['meter-meter'].deleteMany({});
};

exports.clearHandlers = () => {
  meters._HANDLERS.insert = null;
  meters._HANDLERS.remove = null;
  meters._HANDLERS.use = null;
};

exports.setCountHandlers = () => {
  meters.setInsertHandler({
    handler: () => {
      HANDLER_COUNTS.insert++;
    }
  });
  meters.setRemoveHandler({
    handler: () => {
      HANDLER_COUNTS.remove++;
    }
  });
  meters.setUseHandler({
    handler: () => {
      HANDLER_COUNTS.use++;
    }
  });
};

exports.clearHandlerCounts = () => {
  HANDLER_COUNTS.insert = 0;
  HANDLER_COUNTS.remove = 0;
  HANDLER_COUNTS.use = 0;
};

exports.resetCountHandlers = () => {
  exports.clearHandlers();
  exports.setCountHandlers();
  exports.clearHandlerCounts();
};
