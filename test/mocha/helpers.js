/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as database from '@bedrock/mongodb';

export async function cleanDB() {
  await database.collections['meter-meter'].deleteMany({});
}
