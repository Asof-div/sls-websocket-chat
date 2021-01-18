'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const conversation = require('./conversation');
let dynamo = new AWS.DynamoDB.DocumentClient();

const CHAT_MESSAGE_TABLE = 'teraworkChatMessageTable';

module.exports.sendEvent = async(payload) => {  
    payload.PK = payload.PK ? payload.PK : uuidv4();
    payload.SK = "EVT";
    payload.timestamp = Date.now();
    const item = {
      PK: payload.PK,
      SK: payload.SK,
      conversationId: payload.conversationId,
      userName: payload.userName,
      messageType: payload.messageType,
      messageTitle: payload.messageTitle,
      message: payload.message,
      timestamp: payload.timestamp,
      referencePK: payload.referencePK,
      referenceType: payload.referenceType,
      referenceMessage: payload.referenceMessage,
      referenceTimestamp: payload.referenceTimestamp
    }
    


    const params = {
      TableName: CHAT_MESSAGE_TABLE,
      Item: item
    };
  
    return dynamo.put(params).promise();
  }

  
