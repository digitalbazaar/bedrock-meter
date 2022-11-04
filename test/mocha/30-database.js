/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {meters} from '@bedrock/meter';
import {cleanDB, generateId} from './helpers.js';

describe('Meters Database Tests', function() {
  let meter1;
  describe('Indexes', function() {
    beforeEach(async () => {
      await cleanDB();
      meter1 = {id: await generateId()};
      const meter2 = {id: await generateId()};
      // mutliple records are inserted here in order to do proper assertions
      // for 'nReturned', 'totalKeysExamined' and 'totalDocsExamined'.
      await meters.insert({meter: meter1});
      await meters.insert({meter: meter2});
    });
    it(`is properly indexed for 'meter.id' and 'meter.sequence' in update()`,
      async function() {
        meter1.sequence = 1;
        const {executionStats} = await meters.update({
          meter: meter1, explain: true
        });
        executionStats.nReturned.should.equal(1);
        executionStats.totalKeysExamined.should.equal(1);
        executionStats.totalDocsExamined.should.equal(1);
        executionStats.executionStages.inputStage.inputStage.stage
          .should.equal('IXSCAN');
        executionStats.executionStages.inputStage.inputStage.keyPattern
          .should.eql({'meter.id': 1});
      });
    it(`is properly indexed for 'meter.id' in get()`,
      async function() {
        const {executionStats} = await meters.get({
          id: meter1.id, explain: true
        });
        executionStats.nReturned.should.equal(1);
        executionStats.totalKeysExamined.should.equal(1);
        executionStats.totalDocsExamined.should.equal(1);
        executionStats.executionStages.inputStage.inputStage.inputStage.stage
          .should.equal('IXSCAN');
        executionStats.executionStages.inputStage.inputStage.inputStage
          .keyPattern.should.eql({'meter.id': 1});
      });
    it(`is properly indexed for 'meter.id' in remove()`,
      async function() {
        const {executionStats} = await meters.remove({
          id: meter1.id, explain: true
        });
        executionStats.nReturned.should.equal(1);
        executionStats.totalKeysExamined.should.equal(1);
        executionStats.totalDocsExamined.should.equal(1);
        executionStats.executionStages.inputStage.inputStage.stage
          .should.equal('IXSCAN');
        executionStats.executionStages.inputStage.inputStage
          .keyPattern.should.eql({'meter.id': 1});
      });
  });
});
