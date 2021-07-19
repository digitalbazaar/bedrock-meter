/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

const database = require('bedrock-mongodb');

exports.cleanDB = async () => {
  await database.collections['meter-meter'].deleteMany({});
};
