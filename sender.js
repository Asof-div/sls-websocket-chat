'use strict';

const AWS = require('aws-sdk');
const databaseManager = require('./databaseManager');


module.exports.send = async(endpoint, connectionId, msg={action: ''}) => {
    const body = msg;  
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: endpoint
    });
  
    const params = {
      ConnectionId: connectionId,
      Data: JSON.stringify(body)
    };
  
    try {
      await apigwManagementApi.postToConnection(params).promise();
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`);
        await databaseManager.deleteConnection(`CONN#${connectionId}`)
      } else {
        console.log('cannot send', connectionId, e)
        throw e;
      }
    }
  };
  
  
  module.exports.getEndpoint = (event) => {
    return event.requestContext.domainName + "/" + event.requestContext.stage;
  }
