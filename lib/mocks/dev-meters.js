/*!
 * Copyright (c) 2021-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as meters from '../meters.js';

const mockMeters = [{
  // stable multibase id
  id: 'z19ygjQcNmQ9AbG7hCF39Kizs',
  // default application id, from br-app-identity
  controller: 'did:key:z6MksNZwi2r6Qxjt3MYLrrZ44gs2fauzgv1dk4E372bNVjtc',
  // default product id for Example WebKMS Product
  product: {id: 'urn:uuid:80a82316-e8c2-11eb-9570-10bf48838a29'},
  // default WebKMS id, from br-app-identity
  serviceId: 'did:key:z6MkwZ7AXrDpuVi5duY2qvVSx1tBkGmVnmRjDvvwzoVnAzC4'
}, {
  // stable multibase id
  id: 'z19qxQFUcW438uJsNuQwZKQMc',
  // application id used in private application repositories
  controller: 'did:key:z6MkqiqpC8F46164m2w7fprNoqd3XK1jZniP5GMG3fmsADvv',
  // default product id for Example WebKMS Product
  product: {id: 'urn:uuid:80a82316-e8c2-11eb-9570-10bf48838a29'},
  // default WebKMS id, from br-app-identity
  serviceId: 'did:key:z6MkwZ7AXrDpuVi5duY2qvVSx1tBkGmVnmRjDvvwzoVnAzC4'
}];

bedrock.events.on('bedrock-mongodb.ready', async () => {
  if(!bedrock.config.meter.addMockMeters) {
    return;
  }

  await meters._insertMeters({meters: mockMeters});
});
