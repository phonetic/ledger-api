'use strict';

const dynamodb = require('./dynamodb');

module.exports.list = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_API_TOKEN_TABLE,
  };

  // fetch all tokens from the database
  dynamodb.scan(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the tokens.',
      });
      return;
    }

    var total_count = result.Items.length;

    var page = event["queryStringParameters"]['_page'];
    var limit = event["queryStringParameters"]['_limit'];

    // @todo: find a better way with LastEvaluatedKey that wouldn't require pulling every page
    var qtyToRemoveFromFront = (page - 1) * limit;
    while( qtyToRemoveFromFront >= 1 ) {
      result.Items.shift();
      qtyToRemoveFromFront--;
    }

    if ( result.Items.length > limit ) {
      var qtyToRemoveFromEnd = result.Items.length - limit;
      while( qtyToRemoveFromEnd >= 1 ) {
        result.Items.pop();
        qtyToRemoveFromEnd--;
      }
    }

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Expose-Headers': 'Content-Type, x-total-count',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'x-total-count': total_count,
      },
      body: JSON.stringify(result.Items),
    };
    callback(null, response);
  });

};