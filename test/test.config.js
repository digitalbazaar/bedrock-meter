/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config.mocha.tests.push(path.join(__dirname, 'mocha'));

// mongodb config
config.mongodb.name = 'bedrock_meter_test';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
// drop all collections on initialization
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

config.meter.initialMeters = [
  {
    id: 'z1A2E8GAQazt1FTTp8jYJ28Jt',
    controller: 'did:key:z6MksNZwi2r6Qxjt3MYLrrZ44gs2fauzgv1dk4E372bNVjtc',
    product: {id: 'urn:uuid:80a82316-e8c2-11eb-9570-10bf48838a29'},
    serviceId: 'did:key:z6MkwZ7AXrDpuVi5duY2qvVSx1tBkGmVnmRjDvvwzoVnAzC4'
  }
];
