const database = require('bedrock-mongodb');

exports.cleanDB = async () => {
  await database.collections['meter-meter'].deleteMany({});
};
