/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import assert from 'assert-plus';
import * as bedrock from 'bedrock';
import * as database from 'bedrock-mongodb';
import {IdGenerator} from 'bnid';

const {util: {BedrockError}} = bedrock;

// 128 bit random id generator
const idGenerator = new IdGenerator({bitLength: 128});

// TODO: add description; this handler must be called when creating/inserting a
// new meter as a gating function
let _insertHandler;
// TODO: add description; this handler must be called from `.use()`
let _useHandler;

bedrock.events.on('bedrock.start', async () => {
  // FIXME: ensure `setHandler` has been called to register required handlers;
  // i.e., ensure that `_insertHandler` and `_useHandler` are set
});

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await database.openCollections(['meter-meter']);

  await database.createIndexes([{
    collection: 'meter-meter',
    fields: {'meter.id': 1},
    options: {unique: true, background: false}
  }]);
});

// FIXME: add and document typical CRUD functions
async function insert({} = {}) {
}

async function update({} = {}) {
  // FIXME: should only update core properties of the meter
}

async function get({} = {}) {
}

async function remove({} = {}) {
}

// meter: {id, usage: {storage, operations}}

async function use({storage, operations} = {}) {
  // TODO:
  // 1. update meter database record's storage to use reported number
  // 2. increment meter database record's operations by incrementing using
  //    the given `operations`
  // Note: so operations get incremented, but storage is just "current use" so
  // its a simple set operation, use $set: storage, $inc: operations

  // TODO: do the above using `findAndUpdateOne` so that the meter record is
  // returned with the updated values -- and pass the usage in it to
  // `await _useHandler({usage})`
}
