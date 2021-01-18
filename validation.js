let validate = require("validate.js");

function success(attributes) {
    console.log("Success!", attributes);
  }
  
  function error(errors) {
    if (errors instanceof Error) {
      // This means an exception was thrown from a validator
      console.err("An error ocurred", errors);
    } else {
      console.log("Validation errors", errors);
    }
  }
  

  var attributes = {
    name: "Nicklas",
    country: "Sweden",
    someMaliciousAttribute: "scary value"
  };
  
  const validateMessage = (payload) => {
    let constraints = {
        timestamp: { presence : {allowEmpty: false} },
        senderName: { presence : {allowEmpty: false} },
        senderType: { presence : {allowEmpty: false} },
        receiverName: { presence : {allowEmpty: false} },
        receiverType: { presence : {allowEmpty: false} },
        conversationId: { presence : true },
        messageType: {presence: {allowEmpty: false}},
        message: { presence : {allowEmpty: false} },
      };
      
    return validate(payload, constraints);
  }

  const validateUpload = (payload) => {
    let constraints = {
        timestamp: { presence : {allowEmpty: false} },
        senderName: { presence : {allowEmpty: false} },
        senderType: { presence : {allowEmpty: false} },
        receiverName: { presence : {allowEmpty: false} },
        receiverType: { presence : {allowEmpty: false} },
        conversationId: { presence : true },
        messageType: {presence: {allowEmpty: false}},
        filename: { presence : {allowEmpty: false} },
        fileUrl: { presence : {allowEmpty: false} },
      };
      
    return validate(payload, constraints);
  }

  const validateBroadcast = (payload) => {
    let constraints = {
        senderName: { presence : {allowEmpty: false} },
        senderType: { presence : {allowEmpty: false} },
        conversationId: { presence : true },
        messageType: {presence: {allowEmpty: false}},
        message: { presence : {allowEmpty: false} },
      };
      
    return validate.async(payload, constraints);
  }

  const validateQuote = (payload) => {
    let constraints = {
        timestamp: { presence : {allowEmpty: false} },
        senderName: { presence : {allowEmpty: false} },
        senderType: { presence : {allowEmpty: false} },
        receiverName: { presence : {allowEmpty: false} },
        receiverType: { presence : {allowEmpty: false} },
        conversationId: { presence : true },
        messageType: {presence: {allowEmpty: false}},
        items: { presence : {allowEmpty: false} },
      };
      
    return validate(payload, constraints);
  }
module.exports= {
  validateMessage: validateMessage,
  validateQuote: validateQuote,
  validateUpload: validateUpload,
  validateBroadcast: this.validateBroadcast
};
  