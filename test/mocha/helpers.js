/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as database from '@bedrock/mongodb';
import {generateId as _generateId} from 'bnid';

export async function cleanDB() {
  await database.collections['meter-meter'].deleteMany({});
}

export async function generateId() {
  return _generateId({
    bitLength: 128,
    encoding: 'base58',
    multibase: true,
    multihash: true
  });
}
