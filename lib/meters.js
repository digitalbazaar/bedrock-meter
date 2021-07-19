/*!
 * Copyright (c) 2021 Digital Bazaar, Inc. All rights reserved.
 */
import assert from 'assert-plus';
import * as bedrock from 'bedrock';
import * as database from 'bedrock-mongodb';
import {IdDecoder} from 'bnid';

const {util: {BedrockError}} = bedrock;

// base58-multibase decoder for efficiently storaging meter IDs
const idDecoder = new IdDecoder({
  encoding: 'base58',
  multibase: true
});

bedrock.events.on('bedrock-mongodb.ready', async () => {
  await database.openCollections(['meter-meter']);

  await database.createIndexes([{
    collection: 'meter-meter',
    fields: {'meter.id': 1},
    options: {unique: true, background: false}
  }]);
});

/*
 * Insert a meter record.
 *
 * @param {object} options - Options to use.
 * FIXME
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

/*
 * Update a meter record. Changing the usage stats for a meter must be done
 * via `use`.
 *
 * @param {object} options - Options to use.
 * @param {object} options.meter - The meter id and fields to update.
 * @param {string} options.meter.id - The ID for the meter.
 * @param {string} options.meter.* - Other meter fields.
 *
 * @returns {Promise<object>} The meter record.
 */
export async function update({meter} = {}) {
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
  // only allow changing this set of properties:
  for(const p of ['controller', 'sequence']) {
    if(p in meter) {
      $set[`meter.${p}`] = meter[p];
    }
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

/*
 * Gets a meter record identified by `id`.
 *
 * @param {object} options - Options to use.
 * @param {string} options.id - The ID for the meter.
 *
 * @returns {Promise<object>} The meter record.
 */
export async function get({id} = {}) {
  assert.string(id, 'id');

  const collection = database.collections['meter-meter'];
  const query = {'meter.id': Buffer.from(idDecoder.decode(id))};
  const projection = {_id: 0};
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
 *
 * @returns {Promise<object>} The meter record.
 */
export async function remove({id} = {}) {
  assert.string(id, 'id');

  const collection = database.collections['meter-meter'];
  const query = {'meter.id': Buffer.from(idDecoder.decode(id))};
  await collection.deleteOne(query, database.writeOptions);
}

// meter: {id, usage: {storage, operations}}
/**
 * FIXME
 *
 * @param {object} options - Options to use.
 * FIXME
 *
 * @returns {Promise<object>} The meter record.
 */
export async function use({storage = 0, operations = 0} = {}) {
  assert.number(storage, 'storage');
  assert.number(operations, 'operations');

  // TODO:
  // 1. update meter database record's storage to use reported number
  // 2. increment meter database record's operations by incrementing using
  //    the given `operations`
  // Note: so operations get incremented, but storage is just "current use" so
  // its a simple set operation, use $set: storage, $inc: operations

  // TODO: do the above using `findAndUpdateOne` so that the meter record is
  // returned with the updated values -- and return updated values
}
