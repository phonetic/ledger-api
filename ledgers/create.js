'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
  
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

// @todo: validate data.actions, data.name, data.description

  const params = {
    TableName: process.env.DYNAMODB_LEDGER_TABLE,
    Item: {
      ledger_id: uuid.v1(),
      actions: data.actions,
      created_at: timestamp,
      updated_at: timestamp,
      name: data.name,
      description: data.description
    },
  };

  // write the ledger to the database
  dynamoDb.put(params, (error) => {
    // handle potential errors
    if (error) {
      console.log( params );
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t create the ledger.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Expose-Headers': 'Content-Type, x-total-count',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      },
      body: JSON.stringify(params.Item),
    };
    callback(null, response);
  });
};