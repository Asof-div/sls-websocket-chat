'use strict';

const AWS = require('aws-sdk');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
let dynamo = new AWS.DynamoDB.DocumentClient();

const CHAT_CONVERSATION_TABLE = 'teraworkChatConversationTable';

module.exports.createPeerConversation = async(item, id) => {

      //get all conversation for a user (buyer,)
      let user1 = {
        PK: `CONV#${id}`,
        SK: `USER#${item.senderName}`,
        userName: item.senderName,
        userType: item.senderType,
        userId: parseInt(item.senderId),
        title: item.receiverName,
        avatarId: parseInt(item.receiverId),
        members: [item.senderName, item.receiverName],
        conversationId: id,
        type: "P2P",
        status: "Open",
        timestamp: Date.now(),
        createdAt: Date.now(), 
        projects: 0, 
      }

      let user2 = {
        PK: `CONV#${id}`,
        SK: `USER#${item.receiverName}`,
        userName: item.receiverName,
        userType: item.receiverType,
        userId: parseInt(item.receiverId),
        title: item.senderName,
        avatarId: parseInt(item.senderId),
        members: [item.senderName, item.receiverName],
        conversationId: id,
        type: "P2P",
        status: "Open",
        timestamp: Date.now(),
        createdAt: Date.now(),
        projects: 0, 
      }

      if(item.workstoreId){
        user1.workstoreId = item.workstoreId;
        user1.title = `job#${item.workstoreId}`;
        user1.jobOrder = false;
        user2.workstoreId = item.workstoreId;
        user2.title = `job#${item.workstoreId} - ${item.senderName}`;
        user2.jobOrder = false;

        axios.post(`url`, {
                name: item.senderName,
                buyer_id: item.receiverId,
                seller_id: item.senderId,
                workstore_id: item.workstoreId,
                conversation_id: id,
            })
            .then(function (response) {
                // console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });

      }

    const params = {
      TransactItems: [{
        Put: {
          TableName: CHAT_CONVERSATION_TABLE,
          Item: user1
        }
      }, {
        Put: {
          TableName: CHAT_CONVERSATION_TABLE,
          Item: user2
        }
      }],
      
    };
  
    await dynamo.transactWrite(params).promise();
};

module.exports.getConversations = async(username) => {  
  const params = {
    TableName: CHAT_CONVERSATION_TABLE,
    IndexName: "filter-conversations-by-user",
    KeyConditionExpression: 'userName = :rkey',
    ExpressionAttributeValues: {
      ':rkey': username
    }
  };

  return dynamo.query(params).promise();
}

module.exports.updateConversation = (conversationId, senderName, receiverName, deliver=false) => {

  const params = {
    TableName: CHAT_CONVERSATION_TABLE,
    Key: {
      PK: 'CONV#'+conversationId,
      SK: 'USER#'+senderName,
    },
    UpdateExpression: "set #t=:t",
    ExpressionAttributeNames:{
      "#t":"timestamp",
    },
    ExpressionAttributeValues:{
        ":t": Date.now(),
    }
  };
  const params2 = {
    TableName: CHAT_CONVERSATION_TABLE,
    Key: {
      PK: 'CONV#'+conversationId,
      SK: 'USER#'+receiverName,
    },
    UpdateExpression: "set #t=:t",
    ExpressionAttributeNames:{
      "#t":"timestamp",
    },
    ExpressionAttributeValues:{
        ":t": Date.now(),
    }
  };

  dynamo.update(params).promise().then(response => {
    return response.Attributes;
  });
  if(deliver){
    dynamo.update(params2).promise().then(response => {
      return response.Attributes;
    });
  }



}

module.exports.updateConversationStatus = (conversationId, senderName, receiverName, status) => {

  const params = {
    TableName: CHAT_CONVERSATION_TABLE,
    Key: {
      PK: 'CONV#'+conversationId,
      SK: 'USER#'+senderName,
    },
    UpdateExpression: "set #st=:st",
    ExpressionAttributeNames:{
      "#st":"status",
    },
    ExpressionAttributeValues:{
        ":st": status,
    }
  };
  const params2 = {
    TableName: CHAT_CONVERSATION_TABLE,
    Key: {
      PK: 'CONV#'+conversationId,
      SK: 'USER#'+receiverName,
    },
    UpdateExpression: "set #st=:st",
    ExpressionAttributeNames:{
      "#st":"status",
    },
    ExpressionAttributeValues:{
        ":st": status,
    }
  };

  dynamo.update(params).promise().then(response => {
    return response.Attributes;
  });
  if(deliver){
    dynamo.update(params2).promise().then(response => {
      return response.Attributes;
    });
  }



}