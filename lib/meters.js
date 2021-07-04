/*!
 * Copyright (c) 2020-2021 Digital Bazaar, Inc. All rights reserved.
 */
import assert from 'assert-plus';
import * as bedrock from 'bedrock';
import * as database from 'bedrock-mongodb';
import {IdGenerator, IdEncoder} from 'bnid';

const {util: {BedrockError}} = bedrock;

// 128 bit random id generator
const idGenerator = new IdGenerator({bitLength: 128});
// base58, multibase, fixed-length encoder
const idEncoder = new IdEncoder({
  encoding: 'base58', fixedLength: true, multibase: true
});

const HANDLERS = {
  // TODO: add description; this handler must be called when creating/inserting
  // a new meter as a gating function
  insert: null,
  // TODO: add description; this handler must be called when removing meter
  remove: null,
  // TODO: add description; this handler must be called from `.use()`
  use: null
};

bedrock.events.on('bedrock.start', async () => {
  console.log('METER BEDROCK.START', HANDLERS);
  _checkHandlerSet({name: 'insert', handler: HANDLERS.insert});
  _checkHandlerSet({name: 'remove', handler: HANDLERS.remove});
  _checkHandlerSet({name: 'use', handler: HANDLERS.use});
});

bedrock.events.on('bedrock-mongodb.ready', async () => {
  console.log('M MDB.READY');
  await database.openCollections(['meter-meter']);

  await database.createIndexes([{
    collection: 'meter-meter',
    fields: {'meter.id': 1},
    options: {unique: true, background: false}
  }]);
});

export function setInsertHandler({handler} = {}) {
  assert.func(handler, 'handler');
  _checkHandlerNotSet({name: 'insert', handler: HANDLERS.insert});
  HANDLERS.insert = handler;
}

export function setRemoveHandler({handler} = {}) {
  assert.func(handler, 'handler');
  _checkHandlerNotSet({name: 'remove', handler: HANDLERS.remove});
  HANDLERS.remove = handler;
}

export function setUseHandler({handler} = {}) {
  assert.func(handler, 'handler');
  _checkHandlerNotSet({name: 'use', handler: HANDLERS.use});
  HANDLERS.use = handler;
}

/*
 * Insert a meter record.
 *
 * @param {object} options - Options to use.
 * FIXME
 *
 * @returns {Promise<object>} The meter record.
 */
/* FIXME
- meters.create
- Create a new meter, requires a registered async hook that is called to check
  if the meter should be created
  - Will be implemented in veres-products to require and check `zSubscription`
- Requires a related service DID
- Requires a `controller`; any controller with a valid `zSubscription` and
  referenced service can create a meter
- Meter holds a `zMeter` zcap delegated to the service, must be given to the
  service by the user to create new instances at that service
*/
export async function insert({
  serviceDid, controller, zMeter
} = {}) {
  await HANDLERS.insert(/* FIXME */);

  const collection = database.collections['meter-meter'];
  //console.log('I C', collection);
  const now = Date.now();
  const meta = {created: now, updated: now};
  const meter = {
    id: idEncoder.encode(await idGenerator.generate()),
    controller
    // FIXME
    //serviceDid
    //zMeter
  };
  const record = {meta, meter};
  //console.log('I R1', record);
  const result = await collection.insertOne(record, database.writeOptions);
  //console.log('I R2', result);
  // return record if inserted
  if(result.insertedCount === 1) {
    return record;
  }
  return false;
}

/*
 * Update a meter record.
 *
 * @param {object} options - Options to use.
 * @param {object} options.meter - The meter id and fields to update.
 * @param {string} options.meter.id - The ID for the meter.
 * @param {string} options.meter.* - Other meter fields.
 *
 * @returns {Promise<object>} The meter record.
 */
/* FIXME
meters.update
- Allows `zSubscription` to be updated (but it must be checked and found to be
  a valid value)
- Allows `controller` to change? Or not?
- Service cannot be changed, meters are immutably bound to a particular
  service.
*/
export async function update({
  meter
} = {}) {
  // FIXME: should only update core properties of the meter
  const collection = database.collections['meter-meter'];
  const query = {'meter.id': meter.id};
  const now = Date.now();
  const $set = {
    'meta.updated': now
  };
  for(const p of ['controller' /* FIXME */]) {
    console.log('XXX', {p, meter, x: p in meter});
    if(p in meter) {
      $set[`meter.${p}`] = meter[p];
    }
  }
  console.log('U', {meter, query, $set});
  const result = await collection.updateOne(
    query, {$set}, database.writeOptions);
  console.log('UR', result);
  // FIXME: handle result
  // FIXME: call handlers?
  // FIXME: return record
}

/*
 * Gets a meter record identified by `meterId`.
 *
 * @param {object} options - Options to use.
 * @param {string} options.meterId - The ID for the meter.
 *
 * @returns {Promise<object>} The meter record.
 */
export async function get({meterId} = {}) {
  const collection = database.collections['meter-meter'];
  const query = {'meter.id': meterId};
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
  return record;
}

/**
 * Removes a meter record identified by `internalId`.
 *
 * @param {object} options - Options to use.
 * @param {string} options.meterId - The ID for the meter.
 *
 * @returns {Promise<object>} The meter record.
 */
/*
meters.remove
- Removes a meter; details around how that affects billing TBD
- Removing a meter should disable the service using it to stop functioning
*/
export async function remove({meterId} = {}) {
  const collection = database.collections['meter-meter'];
  const query = {'meter.id': meterId};
  await collection.deleteOne(query, database.writeOptions);

  await HANDLERS.remove(/* FIXME */);
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
/*
meters.use
- Causes the registered usage handler to be called which returns usage limits?
- Do we need to store anything here? Should all behavior here be externalized
  via the handler? We probably need to store something in case the use handler
  fails (as it may hit an external system) -- so we can forward all updates the
  next time it's working.
*/
export async function use({storage, operations} = {}) {
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

// expose HANDLERS for test purposes only
export const _HANDLERS = HANDLERS;

function _checkHandlerSet({name, handler}) {
  if(!handler) {
    throw new BedrockError(
      'Meter handler not set.',
      'InvalidStateError', {name});
  }
}

function _checkHandlerNotSet({name, handler}) {
  // can only set handlers once
  if(handler) {
    throw new BedrockError(
      'Meter handler already set.',
      'DuplicateError', {name});
  }
}
