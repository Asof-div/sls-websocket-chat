'use strict';

const axios = require('axios');
const validator = require('../validation');
const sender = require('../sender');
const databaseManager = require('../databaseManager');

const shareQuote = async(event) => {
    let payload = JSON.parse(event.body);
    let endpoint = sender.getEndpoint(event);
    try{
        const failed = validator.validateQuote(payload)
        if(failed){
            payload.error = failed
            await sender.send(endpoint, event.requestContext.connectionId, {action: 'failed-msg', data: payload});
            return {statusCode: 422, body: JSON.stringify(failed)}
        }
    
        await databaseManager.shareQuote(payload);
        
        //get receiver connectionIds
        let connectionData = await databaseManager.getConnections(payload.receiverName);
        
        console.log('connections', connectionData)
        console.log(payload);
        if(payload.deliver == true){
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
            const allQuoteDescription = payload.items.map((quote) => {
                return quote.description;
              }).join(' ** ');

            const eventPayload = {
                message: 'You may have violated our policy that prohibit you from sharing contact details at this stage. We will provide update after further review.',
                messageTitle: 'Message Under Review',
                userName: payload.senderName,
                conversationId: payload.conversationId,
                messageType: 'event',
                referencePK: payload.PK,
                referenceTimestamp: payload.timestamp,
                referenceType: payload.messageType,
                referenceMessage: allQuoteDescription,
            }

            await databaseManager.sendEvent(eventPayload);
            console.log('saved event', eventPayload);
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
                message: allQuoteDescription
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
            
        }
        
    }catch(err){
        // logging error
        console.error('failed database call', err);
        return {statusCode: 500, body: JSON.stringify(err)};
    }

    return {statusCode: 200, body: 'quote sent'};
    
}

const updateQuote = async(event) => {
    let payload = JSON.parse(event.body);
    let endpoint = sender.getEndpoint(event);
    try{
        const failed = validator.validateQuote(payload)
        if(failed){
            payload.error = failed
            await sender.send(endpoint, event.requestContext.connectionId, {action: 'failed-msg', data: payload});
            return {statusCode: 422, body: JSON.stringify(failed)}
        }
    
        await databaseManager.updateQuote(payload);;
        console.log(payload);
        if(payload.deliver == true){
            //get receiver connectionIds
            let connectionData = await databaseManager.getConnections(payload.receiverName);

            console.log('connections', connectionData)
            
            delete payload.receiverName;        
            const postCalls = connectionData.Items.map( async (connectionId) => {
                return await sender.send(endpoint, connectionId.connectionId, {action: 'incoming', data: payload});
            });

            // send composed message to all connected users
            await Promise.all(postCalls);
            
            console.log('sending feedback')

            await sender.send(endpoint, event.requestContext.connectionId, {action: 'sent', data: payload});
        }else{
            const allQuoteDescription = payload.items.map((quote) => {
                return quote.description;
              }).join(' ** ');

            const eventPayload = {
                message: 'You may have violated our policy that prohibit you from sharing contact details at this stage. We will provide update after further review.',
                messageTitle: 'Message Under Review',
                userName: payload.senderName,
                conversationId: payload.conversationId,
                messageType: 'event',
                referencePK: payload.PK,
                referenceTimestamp: payload.timestamp,
                referenceType: payload.messageType,
                referenceMessage: allQuoteDescription,
            }

            await databaseManager.sendEvent(eventPayload);
            console.log('saved event', eventPayload);
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
                message: allQuoteDescription
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
        
    }catch(err){
        // logging error
        console.error('failed database call', err);
        return {statusCode: 500, body: JSON.stringify(err)};
    }

    return {statusCode: 200, body: 'quote sent'};
    
}

module.exports.shareQuote = shareQuote;

module.exports.updateQuote = updateQuote;