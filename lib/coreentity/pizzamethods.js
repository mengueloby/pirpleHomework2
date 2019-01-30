/*
* User action request handler for menus 
*
*/

// Dependencies
var _data = require('./../serializer');
var tokenizer = require('./tokenizer');
var util = require('./../utils');
var config = require('./../config');
var workers = require('./../workers');

// Define all the user action handler methods
var pizzamethods = {};



// Pizza - get get all menus
// Required paramas: email
// Optional data: none
pizzamethods.getmenus = function(data,callback){
  // Check that email is filled out
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the email
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('menus','pizzalist.json',function(err,data){
          if(!err && data){
            workers.log('menulist', email, 'getmenus', 200); 
            callback(200,data);
          } else {
            workers.log('menulist', email, 'getmenus', 404);
            callback(404);
          }
        });
        tokenizer.extendToken(tokenData);  
      } else if(tokenIsValid == 0){ // not valid for a user
        callback(403,{"Error" : "Token is invalid."});
      } else if(tokenIsValid == -2){ // token expired, logout the user
         tokenizer.logout(data,function(status, message){
             callback(status,message);
         }); 
      } else if(tokenIsValid == -1){ // token missing
        callback(403,{"Error" : "Token is required."});
      }
    });
  } else {
    callback(400,{'Error' : 'Missing required field'})
  }
};


//export the module
module.exports = pizzamethods;