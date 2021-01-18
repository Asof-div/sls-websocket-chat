'use strict';

const axios = require('axios');
const sender = require('../sender');
const databaseManager = require('../databaseManager');

module.exports.connect = async(event) => {
    let username= event.queryStringParameters != undefined ? event.queryStringParameters.username : event.headers.username;
    console.log('username', username);
    
    if (username != null && username != "null" && username != "" && username != undefined) {
        try {
            //Add connection to the database
            console.log('before adding to connection to db', event.requestContext.connectionId);
            const result = await databaseManager.addUserConnection(event.requestContext.connectionId, username)
            console.log('after successfull call to the database', result);

            // get all connected users
            let connectionData;
            connectionData = await databaseManager.getConnectionIds();

            // compose payload for online users
            console.log('successfully return connected user from DB', connectionData.Items);
            const connections = connectionData.Items.filter(conn => conn.connectionId !== event.requestContext.connectionId);
            const payload = {
                action: 'connections',
                data: connectionData.Items
            };

            axios.post(`https://api.terawork.com/websocket/online/${username}`, {
                    username: username,
                })
                .then(function (response) {
                    console.log(`api call online ${username}`, response);
                })
                .catch(function (error) {
                    console.log(`api call online ${username}`, error);
                });

            console.log('connections ', connections);
            // get endpoint
            const endpoint = sender.getEndpoint(event);

            const postCalls = connections.map( async (connectionId) => {
                return await sender.send(endpoint, connectionId.connectionId, payload);
            });

            // send composed message to all connected users
            await Promise.all(postCalls);
            
            console.log('finally we send connection status to all user');
        
            return { statusCode: 200, body: 'Connected.' };

        } catch(err) {
            // logging error
            console.error('failed database call', err);
            return {statusCode: 500, body: JSON.stringify(err)};
        }
    } else {

        return  {statusCode: 401, body: 'Username not exist.'};
    }
  
};
  
