'use strict';

const axios = require('axios');
const validator = require('../validation');
const sender = require('../sender');
const databaseManager = require('../databaseManager');


const uploadFile = async(event) => {
    let payload = JSON.parse(event.body);
    let endpoint = sender.getEndpoint(event);
    try{
        const failed = validator.validateUpload(payload)
        if(failed){
            payload.error = failed
            await sender.send(endpoint, event.requestContext.connectionId, {action: 'failed-msg', data: payload});
            return {statusCode: 422, body: JSON.stringify(failed)}
        }
        
        await databaseManager.uploadFile(payload);;
        
        //get receiver connectionIds
        if(payload.deliver == true){
            let connectionData = await databaseManager.getConnections(payload.receiverName);
            console.log('connections', connectionData)

            const postCalls = connectionData.Items.map( async (connectionId) => {
                return await sender.send(endpoint, connectionId.connectionId, {action: 'incoming', data: payload});
            });

            if(connectionData.Items.length < 1){
                axios.post(`url/${payload.receiverName}`, {
                    username: payload.receiverName,
                })
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
            }

            // send composed message to all connected users
            await Promise.all(postCalls);
            
            console.log('sending feedback')

            await sender.send(endpoint, event.requestContext.connectionId, {action: 'sent', data: payload});
        }else{
            const eventPayload = {
                message: 'You may have violated our policy that prohibit you from sharing contact details at this stage. We will provide update after further review.',
                messageTitle: 'Message Under Review',
                userName: payload.senderName,
                conversationId: payload.conversationId,
                messageType: 'event',
                referencePK: payload.PK,
                referenceTimestamp: payload.timestamp,
                referenceType: payload.messageType,
                referenceMessage: payload.message,
            }

            await databaseManager.sendEvent(eventPayload);
            console.log('saved event');
            axios.post(`url/flagged-message`, {
                sent_time: payload.timestamp,
                event_pk: eventPayload.PK,
                msg_pk: payload.PK,
                msg_sk: payload.SK,
                msg_type: payload.messageType,
                conv_id: payload.conversationId,
                user_id: payload.senderId,
                user_type: payload.senderType,
                username: payload.senderName,
                message: payload.fileUrl,
                filename: payload.filename,
                file_url: payload.fileUrl,
            })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
            let connectionData = await databaseManager.getConnections(eventPayload.userName);

            const postCalls = connectionData.Items.map( async (connectionId) => {
                return await sender.send(endpoint, connectionId.connectionId, {action: 'incoming', data: eventPayload});
            });

            await Promise.all(postCalls);
            console.log('send event');
        }

        return {statusCode: 200, body: 'message sent'};
        
    }catch(err){
        // logging error
        console.error('failed database call', err);
        return {statusCode: 500, body: JSON.stringify(err)};
    }

    
}


module.exports.uploadFile = uploadFile;