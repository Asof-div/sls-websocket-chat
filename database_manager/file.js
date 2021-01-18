'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const conversation = require('./conversation');
let dynamo = new AWS.DynamoDB.DocumentClient();

const CHAT_MESSAGE_TABLE = 'teraworkChatMessageTable';


  module.exports.uploadFile = async(payload) => {
    const id = uuidv4();
    console.log('start peer')
    if(payload.conversationId == '' || payload.conversationId == null || payload.conversationId.length < 2){
        await conversation.createPeerConversation(payload, id)
        payload.conversationId = id;
    }
    
    payload.PK = payload.PK ? payload.PK : uuidv4();
    payload.SK = "FIL";
    payload.flagged = payload.flagged != undefined ? payload.flagged : !payload.passedViolation;
    payload.deliver = false;
    payload.sent = true;
    const item = {
      PK: payload.PK,
      SK: payload.SK,
      conversationId: payload.conversationId,
      senderName: payload.senderName,
      senderType: payload.senderType,
      messageType: payload.messageType,
      fileUrl: payload.fileUrl,
      filename: payload.filename,
      timestamp: payload.timestamp,
      sent: payload.sent,
      flagged: payload.flagged,
      passedViolation: payload.passedViolation,
      createdAt: payload.timestamp,
      mimeType: payload.mimeType,
    }
    if(payload.workstoreId){
      item.workstoreId = payload.workstoreId;
    }
    if(payload.replyText && payload.replyText.length > 1){
      item.replyText = payload.replyText;
    }
    if(payload.replyOwner && payload.replyOwner.length > 1){
      item.replyOwner = payload.replyOwner;
    }
    if(!payload.flagged ){
      payload.deliveryTime = Date.now();
      item.deliveryTime = payload.deliveryTime;
      payload.deliver = true;
    }

    const params = {
      TableName: CHAT_MESSAGE_TABLE,
      Item: item
    };
  
    conversation.updateConversation(payload.conversationId, payload.senderName, payload.receiverName, payload.deliver);
    const result = await dynamo.put(params).promise();
    
    console.log('file uploaded', result) 
  }
