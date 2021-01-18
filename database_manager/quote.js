'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const conversation = require('./conversation');
let dynamo = new AWS.DynamoDB.DocumentClient();

const CHAT_MESSAGE_TABLE = 'teraworkChatMessageTable';


  module.exports.shareQuote = async(payload) => {
    const id = uuidv4();
    console.log('start peer')
    if(payload.conversationId == '' || payload.conversationId == null || payload.conversationId.length < 4){
        await conversation.createPeerConversation(payload, id)
        payload.conversationId = id;

    }

    await sendChatQuote(payload)
}

  const sendChatQuote = async(payload) => {  
    payload.PK = payload.PK ? payload.PK : uuidv4();
    payload.SK = "QUO";
    payload.flagged = payload.flagged != undefined ? payload.flagged : !payload.passedViolation;
    payload.sellerURLName = payload.sellerURLName ==  undefined ? "-" : payload.sellerURLName; 
    payload.deliver = false;
    payload.sent = true;
    const item = {
      PK: payload.PK,
      SK: payload.SK,
      conversationId: payload.conversationId,
      profileId: parseInt(payload.profileId),
      senderName: payload.senderName,
      senderType: payload.senderType,
      currencyId: payload.currencyId,
      messageType: payload.messageType,
      items: payload.items,
      timestamp: payload.timestamp,
      sent: payload.sent,
      flagged: payload.flagged,
      revision: 0,
      passedViolation: payload.passedViolation,
      deliver:  payload.deliver,
      createdAt:payload.timestamp,
      updatedAt:payload.timestamp,
      expiryDate: payload.expiryDate,
      expirationDate: moment(payload.expiryDate).format('YYYY-MM-DD'),
      sellerURLName: payload.sellerURLName,
      expiryDate: payload.expiryDate,

    }
    
    if(!payload.flagged ){
      payload.deliveryTime = Date.now();
      item.deliveryTime = payload.deliveryTime;
      item.deliver = true;
      payload.deliver = true;
    }
    if(payload.workstoreId){
      item.workstoreId = parseInt(payload.workstoreId);
    }
    const params = {
      TableName: CHAT_MESSAGE_TABLE,
      Item: item
    };
  
    conversation.updateConversation(payload.conversationId, payload.senderName, payload.receiverName, payload.deliver);
    return dynamo.put(params).promise();
  }

  
  module.exports.updateQuote = async(payload) => {
    console.log('payload', payload)
    payload.flagged = payload.flagged != undefined ? payload.flagged : !payload.passedViolation;
    payload.deliver = false;
    payload.sent = true;
    payload.edited = true;
    payload.sellerURLName = payload.sellerURLName ==  undefined ? "-" : payload.sellerURLName; 
    payload.deliveryTime = 0;
    if(!payload.flagged ){
      payload.deliveryTime = Date.now();
      payload.deliver = true;
    }
    payload.updatedAt = payload.updatedAt ? payload.updatedAt : Date.now();

    const params = {
        TableName: CHAT_MESSAGE_TABLE,
        Key: {
          PK: payload.PK,
          SK: payload.SK,
        },
        UpdateExpression: "set #i=:i, #t=:t, updatedByName=:uname, updatedByType=:utype, #d=:d, passedViolation=:pa, #se=:se, #r=:r, #ed=:ed, #pid=:pid, #ex=:ex, #exp=:exp, #upa=:upa, #flag=:flag, #dt=:dt, #surl=:surl, #currencyId=:currencyId",
        ExpressionAttributeNames:{
          "#i":"items",
          "#t":"timestamp",
          "#se":"sent",
          "#r":"revision",
          "#d":"deliver",
          "#ed":"edited",
          "#ex":"expiryDate",
          "#exp":"expirationDate",
          "#pid":"profileId",
          "#upa":"updatedAt",
          "#flag": "flagged",
          "#dt": "deliveryTime",
          "#surl": "sellerURLName",
          "#currencyId": "currencyId"

        },
        ExpressionAttributeValues:{
            ":i":payload.items,
            ":t":payload.timestamp,
            ":uname": payload.updatedByName,
            ":utype": payload.updatedByType,
            ":pa": payload.passedViolation,
            ":se": payload.sent,
            ":d": payload.deliver,
            ":dt": payload.deliveryTime,
            ":r":payload.revision,
            ":ed": payload.edited,
            ":pid": parseInt(payload.profileId),
            ":ex": payload.expiryDate,
            ":upa": payload.updatedAt,
            ":flag": payload.flagged,
            ":surl": payload.sellerURLName,
            ":currencyId": payload.currencyId,
            ":exp": moment(payload.expiryDate).format('YYYY-MM-DD'),
        }
      };
    
      try {
        conversation.updateConversation(payload.conversationId, payload.senderName, payload.receiverName, payload.deliver);
        await dynamo.update(params).promise();
      } catch (err) {
        throw err;
      }
  }
    