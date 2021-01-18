'use strict';

const axios = require('axios');
const sender = require('../sender');
const databaseManager = require('../databaseManager');

module.exports.disconnect = async (event) => {


    try {
        

        // get all connected users
        let connectionData;
        connectionData = await databaseManager.getConnectionIds();
        //Delete connection from the database
        console.log('before deleting to connection to db');
        await databaseManager.deleteConnection(`CONN#${event.requestContext.connectionId}`)
        
        

        // compose payload for online users
        const allConnections = connectionData.Items.filter(item => item.connectionId !== event.requestContext.connectionId);
        console.log('successfully return connected user from DB', allConnections);
        const payload = {
            action: 'connections',
            data: allConnections
        };

        const conn = connectionData.Items.find(item => item.connectionId == event.requestContext.connectionId) || {user: '-'}
        console.log('connection', conn)
        const otherConns = connectionData.Items.filter(item => item.connectionId !== event.requestContext.connectionId && item.user == conn.user)
        
        if(otherConns < 1){
            axios.post(`https://api.terawork.com/websocket/offline/${conn.user}`, {
                    username: conn.user,
                })
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
            
        // get endpoint
        const endpoint = sender.getEndpoint(event);

        const postCalls = allConnections.map(async (connectionId) => {
            return await sender.send(endpoint, connectionId.connectionId, payload);
        });

        // send composed message to all connected users
        await Promise.all(postCalls);
        
        return { statusCode: 200, body: 'Disconnected.' };

    }catch(err) {
        // logging error
        console.error('failed database call', err);
        return {statusCode: 500, body: JSON.stringify(err)};
    }

  
};
  
