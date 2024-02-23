/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

config.meter = {};

// seed bedrock-meter with mock meters for development
config.meter.addMockMeters = true;

config.meter.initialMeters = [
  /* sample meter
  {
    id: 'z19ygjQcNmQ9AbG7hCF39Kizs',
    controller: 'did:key:z6MksNZwi2r6Qxjt3MYLrrZ44gs2fauzgv1dk4E372bNVjtc',
    product: {id: 'urn:uuid:80a82316-e8c2-11eb-9570-10bf48838a29'},
    serviceId: 'did:key:z6MkwZ7AXrDpuVi5duY2qvVSx1tBkGmVnmRjDvvwzoVnAzC4'
  }
  */
];

config.ensureConfigOverride.fields.push('meter.addMockMeters');
