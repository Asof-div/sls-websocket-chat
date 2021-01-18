'use strict';

const conn = require('./database_manager/connection');
const conv = require('./database_manager/conversation');
const chat = require('./database_manager/chats');
const quote = require('./database_manager/quote');
const event = require('./database_manager/event');
const file = require('./database_manager/file');


module.exports.addUserConnection = conn.addUserConnection;

module.exports.deleteConnection = conn.deleteConnection;

module.exports.getConnectionIds = conn.getConnectionIds;

module.exports.getConnections = conn.getConnections;

module.exports.getConversations = conv.getConversations;

module.exports.updateConversationStatus = conv.updateConversationStatus;

module.exports.sendPeerMessage = chat.sendPeerMessage;

module.exports.getMessages = chat.getMessages;

module.exports.shareQuote = quote.shareQuote;

module.exports.updateQuote = quote.updateQuote;

module.exports.sendEvent = event.sendEvent;

module.exports.uploadFile = file.uploadFile;
