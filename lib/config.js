/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';

config.meter = {};

// seed bedrock-meter with mock meters for development
config.meter.addMockMeters = true;

config.ensureConfigOverride.fields.push('meter.addMockMeters');
