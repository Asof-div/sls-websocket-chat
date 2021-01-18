'use strict';

const AWS = require('aws-sdk');
let dynamo = new AWS.DynamoDB.DocumentClient();

const CHAT_CONNECTION_TABLE = 'teraworkWSConnectionTable';

module.exports.addUserConnection = async(connectionId, username) => {

    let conn = {
        PK: `CONN#${connectionId}`,
        SK: `CONN#${connectionId}`,
        data: username || "Anonymous",
        connectionId: connectionId,
        user: username || "Anonymous"
      }
      let user = {
        PK: `USER#{username}`,
        SK: username,
        data : {
          time: Date(),
          avatar: '',
        },
        name: username
      }

    const params = {
        TableName: CHAT_CONNECTION_TABLE,
        Item: conn
    };
  
    await dynamo.put(params).promise();
  };

  module.exports.deleteConnection = connectionId => {
    const params = {
      TableName: CHAT_CONNECTION_TABLE,
      Key: {
        PK: connectionId, 
        SK: connectionId 
      }
    };
  
    return dynamo.delete(params).promise();
  };

  module.exports.getConnectionIds = async() => {  
    const params = {
      TableName: CHAT_CONNECTION_TABLE,

      // KeyConditionExpression: 'begins_with(PK, :dt) and begins_with(SK, :dt)',
      // ExpressionAttributeValues: {
      //   ':dt': 'CONN#'
      // }
    };
  
    return dynamo.scan(params).promise();
  }

  module.exports.getConnections = async(username) => {  
    const params = {
      TableName: CHAT_CONNECTION_TABLE,
      IndexName: "filter-connections-by-user",
      KeyConditionExpression: '#u = :rkey',
      ExpressionAttributeNames:{
        "#u": 'user'
      },
      ExpressionAttributeValues: {
        ':rkey': username
      }
    };
  
    return dynamo.query(params).promise();
  }
