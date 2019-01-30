/*
 * Helpers for various tasks
 *
 */

// Dependencies
var config = require('./config');
var crypto = require('crypto');
var https = require('https');
var querystring = require('querystring');

// Container for all the helpers
var helpers = {};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
  try{
    var obj = JSON.parse(str);
    return obj;
  } catch(e){
    return {};
  }
};

// Create a SHA256 hash
helpers.hash = function(str){
  if(typeof(str) == 'string' && str.length > 0){
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random charactert from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

helpers.isMail = function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

helpers.sendOrderMail = function(mail,order,callback){
  // Validate parameters
  var email = typeof(mail) == 'string' && mail.trim().length > 0 ? mail.trim() : false;
  var orderinfos = typeof(order) == 'object' ? order : false;
  
  if(email && orderinfos){
     
      var content='Congratulations order done, Transaction Id: '+orderinfos.transId+', Amount: '+orderinfos.amount+' for '+orderinfos.description+'. Thank you!'
       
     
      // Configure the request payload
    var payload = {
      'from' : config.mailgun.apiemail,
      'to' : email,
      'subject' : "About your order",
      'text' : content   
    };
    var stringPayload = querystring.stringify(payload);


    // Configure the request details
    var requestDetails = {
      'protocol' : 'https:',
      'hostname' : 'api.mailgun.net',
      'method' : 'POST',  
      'path' : '/v3/sandbox542cd17d84004c50a0cd736673893b3f.mailgun.org/messages',      
      'auth' : config.mailgun.secretKey,    
      'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails,function(res){
        // Grab the status of the sent request
        var status =  res.statusCode;
        // Callback successfully if the request went through
        if(status == 200 || status == 201){
          callback(1);
        } else {
          callback(0);
        }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
      callback(-1);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request
    req.end();
  } else {
    console.log('Given parameters were missing or invalid for transaction '+orderinfos.transId);
  }
};



helpers.testCardNumbers = {
        '3566002020360505'  : 'tok_jcb',
        '4242424242424242'  : 'tok_visa',
        '4000056655665556'  : 'tok_visa_debit',
        '5555555555554444'  : 'tok_mastercard',
        '5200828282828210'  : 'tok_mastercard_debit',
        '5105105105105100'  : 'tok_mastercard_prepaid',
        '378282246310005'   : 'tok_amex',
        '6011111111111117'  : 'tok_discover',
        '30569309025904'    : 'tok_diners',
        '6200000000000005'  : 'tok_unionpay'
    };

//Send an order via the Stripe payment API
helpers.sendOrderPayment = function(amnt, card, descript, callback) {
    var amount = typeof(amnt) == 'number' && amnt > 0 ? amnt : false;
    var cardNbr = typeof(card) == 'string' && card.trim().length > 0 ? card : false;
    var description = typeof(descript) == 'string' && descript.trim().length > 0 ? descript.trim() : false; 
    var cclist = helpers.testCardNumbers;
    console.log("amount: " + amount + " cardNbr: " + cardNbr + " desc: " + description + " cardToken: " + cclist[cardNbr]);
    if (amount && cardNbr && description) {
        var data = {
            'amount': amount,
            'currency': "usd",
            'source': cclist[cardNbr], 
            'description': description
            };
            
                // Configure the request details
                var stringPayLoad = querystring.stringify(data);
                // Configure the request details
                var requestDetails = {
                    'protocol' : 'https:',
                    'hostname' : 'api.stripe.com',
                    'method' : 'POST',
                    'path' : '/v1/charges',
                    'auth' : config.stripe.secretKey,
                    'headers' : {
                    'Content-Type' : 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(stringPayLoad)
                    },
                    'data' : stringPayLoad
                };
                var req = https.request(requestDetails,function(res) {
                    var status = res.statusCode;
                    // Callback successfully if the request went through
                    if (status == 200 || status ==201) {
                        res.on("data", function (data){
                            var dataObject = JSON.parse(data.toString());                         
                            callback({"status" : status, "transId" : dataObject.id, "paid" : dataObject.paid, "amount" : amount, "description" : description});
                        });
                    } else {
                        // Bind to the error event so it does not get thrown
                        req.on("data", function(err) {
                            var dataObject = JSON.parse(err.toString());                    
                            callback({"status" : status, "message" : dataObject.message});
                        });
                    }
                });    
                // Bind to the error event so it does not get thrown
                req.on("error", function(e) {
                    console.log('damm');
                    callback({});
                });
        
                // add the payload
                req.write(stringPayLoad);
                //end the request
                req.end(); 

    } else {
        callback({'status' : 400, 'message' : "Fields are missing for card payment"});
    }
};






// Export the module
module.exports = helpers;
