/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as database from '@bedrock/mongodb';
import assert from 'assert-plus';
import {IdDecoder} from 'bnid';

const {util: {BedrockError}} = bedrock;

// base58-multibase decoder for efficiently storaging meter IDs
const idDecoder = new IdDecoder({
  encoding: 'base58',
  multibase: true,
  multihash: true,
  expectedSize: 16
});

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await database.openCollections(['meter-meter']);

  await database.createIndexes([{
    collection: 'meter-meter',
    fields: {'meter.id': 1},
    options: {unique: true, background: false}
  }]);
});

/**
 * An object containing information on the query plan.
 *
 * @typedef {object} ExplainObject
 */

/**
 * Insert a meter record.
 *
 * @param {object} options - Options to use.
 * @param {object} options.meter - The meter to insert.
 *
 * @returns {Promise<object>} The meter record.
 */
export async function insert({meter} = {}) {
  assert.object(meter, 'meter');
  assert.string(meter.id, 'meter.id');

  // store record
  const now = Date.now();
  const meta = {created: now, updated: now};
  let record = {
    meter: {
      ...meter,
      sequence: 0,
      // use `Buffer` for storing `id` more efficiently
      id: Buffer.from(idDecoder.decode(meter.id))
    },
    meta
  };

  try {
    const collection = database.collections['meter-meter'];
    const result = await collection.insertOne(record);
    record = result.ops[0];
    record.meter.id = meter.id;
  } catch(e) {
    if(!database.isDuplicateError(e)) {
      throw e;
    }
    throw new BedrockError(
      'Duplicate meter.',
      'DuplicateError', {
        public: true,
        httpStatusCode: 409
      }, e);
  }

  return record;
}

/**
 * Update a meter record. Changing the usage stats for a meter can be done
 * here for administrative resets, but for incremental use reporting, use the
 * `use()` API.
 *
 * @param {object} options - Options to use.
 * @param {object} options.meter - The meter id and fields to update.
 * @param {boolean} [options.explain=false] - An optional explain boolean.
 *
 * @returns {Promise<boolean | ExplainObject>} Resolves with `true` on update
 *   success or an ExplainObject if `explain=true`.
 */
export async function update({meter, explain = false} = {}) {
  assert.object(meter, 'meter');
  assert.string(meter.id, 'meter.id');
  assert.number(meter.sequence, 'meter.sequence');

  // should only update allow list of properties of the meter
  const collection = database.collections['meter-meter'];
  const query = {
    'meter.id': Buffer.from(idDecoder.decode(meter.id)),
    'meter.sequence': meter.sequence - 1
  };
  const now = Date.now();
  const $set = {'meta.updated': now};
  for(const p in meter) {
    // skip `id`, it does not change
    if(p === 'id') {
      continue;
    }
    $set[`meter.${p}`] = meter[p];
  }

  if(explain) {
    // 'find().limit(1)' is used here because 'updateOne()' doesn't return a
    // cursor which allows the use of the explain function.
    const cursor = await collection.find(query).limit(1);
    return cursor.explain('executionStats');
  }

  const result = await collection.updateOne(
    query, {$set}, database.writeOptions);
  if(result.result.n === 0) {
    // no records changed...
    throw new BedrockError(
      'Could not update configuration. ' +
      'Record sequence does not match or meter does not exist.',
      'InvalidStateError', {httpStatusCode: 409, public: true});
  }

  return true;
}

/**
 * Gets a meter record identified by `id`.
 *
 * @param {object} options - Options to use.
 * @param {string} options.id - The ID for the meter.
 * @param {boolean} [options.explain=false] - An optional explain boolean.
 *
 * @returns {Promise<object | ExplainObject>} Resolves with the meter record or
 *   an ExplainObject if `explain=true`.
 */
export async function get({id, explain = false} = {}) {
  assert.string(id, 'id');

  const collection = database.collections['meter-meter'];
  const query = {'meter.id': Buffer.from(idDecoder.decode(id))};
  const projection = {_id: 0};

  if(explain) {
    // 'find().limit(1)' is used here because 'findOne()' doesn't return a
    // cursor which allows the use of the explain function.
    const cursor = await collection.find(query, {projection}).limit(1);
    return cursor.explain('executionStats');
  }

  const record = await collection.findOne(query, {projection});
  if(!record) {
    throw new BedrockError(
      'Entity not found.',
      'NotFoundError', {
        httpStatusCode: 404,
        public: true
      });
  }
  // return encoded meter ID
  record.meter.id = id;
  return record;
}

/**
 * Removes a meter record identified by `internalId`.
 *
 * @param {object} options - Options to use.
 * @param {string} options.id - The ID for the meter.
 * @param {boolean} [options.explain=false] - An optional explain boolean.
 *
 * @returns {Promise<ExplainObject>} Resolves with the ExplainObject if
 *   `explain=true`.
 */
export async function remove({id, explain = false} = {}) {
  assert.string(id, 'id');

  const collection = database.collections['meter-meter'];
  const query = {'meter.id': Buffer.from(idDecoder.decode(id))};

  if(explain) {
    // 'find().limit(1)' is used here because 'deleteOne()' doesn't return a
    // cursor which allows the use of the explain function.
    const cursor = await collection.find(query).limit(1);
    return cursor.explain('executionStats');
  }

  await collection.deleteOne(query, database.writeOptions);
}

/**
 * Updates the usage for this meter.
 *
 * TODO: To be implemented in a future version.
 *
 * @param {object} options - Options to use.
 * @param {object} options.meter - The meter to update.
 * @param {object} options.newUsage - The new usage to report:
 *   {number} options.newUsage.storage - The new current total storage for
 *     the meter
 *   {number} options.newUsage.operations - The new additional operations
 *     to add to the meter.
 *
 * @returns {Promise<object>} The meter record.
 */
export async function use({meter, newUsage} = {}) {
  assert.object(meter, 'meter');
  assert.object(newUsage, 'newUsage');
  assert.number(newUsage.storage, 'newUsage.storage');
  assert.number(newUsage.operations, 'newUsage.operations');

  // TODO:
  // 1. update meter database record's storage to use reported number
  // 2. increment meter database record's operations by incrementing using
  //    the given `operations`
  // Note: so operations get incremented, but storage is just "current use" so
  // its a simple set operation, use $set: storage, $inc: operations

  // TODO: do the above using `findAndUpdateOne` so that the meter record is
  // returned with the updated values -- and return updated values
}
