'use strict';

const AWS = require('aws-sdk');
const databaseManager = require('./databaseManager');
const messageHandler = require('./message/index');
const quoteHandler = require('./quote/index');
const fileHandler = require('./file/index');
const connectionHandler = require('./onconnect/index');
const disconnectionHandler = require('./ondisconnect/index');
const sender = require('./sender');
 
require('aws-sdk/clients/apigatewaymanagementapi'); 


module.exports.connectHandler  = connectionHandler.connect;
module.exports.disconnectHandler  = disconnectionHandler.disconnect;

// THIS ONE DOESNT DO ANYHTING
module.exports.defaultHandler = (event) => {
  console.log('defaultHandler was called', event);

  return {
    statusCode: 200,
    body: 'default msg'
  };
};

module.exports.sendChatMessageHandler = messageHandler.sendMessage

module.exports.shareQuoteHandler = quoteHandler.shareQuote

module.exports.updateQuoteHandler = quoteHandler.updateQuote

module.exports.uploadFileHandler = fileHandler.uploadFile

module.exports.getConversationsHandler = async(event) => {
    try{
    
        const body = JSON.parse(event.body);
      
        const endpoint = sender.getEndpoint(event);

        let arr = Array();
        const result = await databaseManager.getConversations(body.senderName);
        const connectionData = await databaseManager.getConnectionIds();
        console.log('connections', connectionData)
        // result.Items.forEach(item => {
        //   let mes = await databaseManager.getMessages(item.conversationId);
        //   item.messages= mes.Items
        //     arr = [...arr, item];
        // });

        await sender.send(endpoint, event.requestContext.connectionId, { action:'conv-list', data: { convs:result.Items, conns: connectionData.Items } })

    }catch(err){

        // logging error
        console.error('failed database call', err);
        return {statusCode: err.statusCode, body: JSON.stringify(err)};
    }

    return {
      statusCode: 200,
      body: 'conversation sent'
    };
}

module.exports.updateConversationStatusHandler = async(event) => {
  try{
  
      const body = JSON.parse(event.body);
    
      const endpoint = sender.getEndpoint(event);

      let arr = Array();
      const result = await databaseManager.updateConversationStatus(body.conversationId, body.senderName, body.receiverName, body.status);
      console.log('connections', connectionData)
      
      // await sender.send(endpoint, event.requestContext.connectionId, { action:'conv-list', data: { convs:result.Items, conns: connectionData.Items } })

  }catch(err){

      // logging error
      console.error('failed database call', err);
      return {statusCode: err.statusCode, body: JSON.stringify(err)};
  }

  return {
    statusCode: 200,
    body: 'conversation sent'
  };
}


module.exports.getMessagesHandler = async (event) => {
    try{

        let body = JSON.parse(event.body);
        const result = await databaseManager.getMessages(body.conversationId);
        console.log('result', result);
        const payload ={
          action:'msg-list', 
          data:{
            conversationId: body.conversationId,
            messages: result.Items
          }
        }
        let endpoint = sender.getEndpoint(event);
        await sender.send(endpoint, event.requestContext.connectionId, payload)

    }catch(err){
        // logging error
        console.error('failed database call', err);
        return {statusCode: err.statusCode, body: JSON.stringify(err)};
    }

    return {
      statusCode: 200,
      body: 'messages sent'
    };
}
