/*
* User entity request handler 
*
*/

// Dependencies
var _data = require('./../serializer');
var tokenizer = require('./tokenizer');
var util = require('./../utils');
var config = require('./../config');

// Container for all the user entity handler method
var usermethods = {};



// User registration
// Required data: email, password, name, street
// Optional data: phone, cc(credit card)
usermethods.register = function(data,callback){
  // Check that all required fields are filled out
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
  var cc = typeof(data.payload.cc) == 'string' && data.payload.cc.trim().length > 0 ? data.payload.cc.trim() : false;    
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var street = typeof(data.payload.street) == 'string' && data.payload.street.trim().length > 0 ? data.payload.street.trim() : false;
  
  if(name && email && password && street){
    //Be sure that the email is valid
    if(util.isMail(email)){
        
        // Make sure the user doesnt already exist
        _data.read('users',email+'.json',function(err,data){
          if(err){
            // Hash the password
            var hashedPassword = util.hash(password);
            // Create the user object
            if(hashedPassword){
              var userObject = {
                name : name,
                email : email,
                hashedPassword : hashedPassword,
                street : street,
                cc: '4000056655665556',  // by default (credit card), just for test
                cart : [],
                orders : [],
                isconnected : false  
              };
             if(phone)
                 userObject.phone=phone;
             if(cc)
                 userObject.phone=cc;    
              // Store the user
              _data.create('users',email+'.json',userObject,function(err){
                if(!err){
                  callback(200, {'message': 'User register'});
                } else {
                  callback(500,{'Error' : 'Could not create the new user'});
                }
              });
            } else {
              callback(500,{'Error' : 'Could not hash the user\'s password.'});
            }
          } else {
            // User alread exists
            callback(400,{'Error' : 'A user with that email already exists'});
          }
        });    
    }  else {
        // Mail is not valid
        callback(400,{'Error' : 'The given mail is not valid'});
    }
  } else {
    callback(400,{'Error' : 'Missing required fields'});
  }
};



// Required param: email
// Optional data: none
usermethods.getuser = function(data,callback){  
  // Check that email is filled out
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the email
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('users',email+'.json',function(err,data){
          if(!err && data){
            // Remove the hashed password, cart, orders from the user user object before returning it to the requester
            delete data.hashedPassword;
            delete data.cart;
            delete data.orders;  
            callback(200,data);
          } else {
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



// Required param: email
// Optional data: none
usermethods.getuserfull = function(data,callback){
  // Check that email is filled out
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the email
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('users',email+'.json',function(err,data){
          if(!err && data){
            // Remove the hashed password from the user user object before returning it to the requester
            delete data.hashedPassword;  
            callback(200,data);
          } else {
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



// Required param: email
// Optional data: none
usermethods.getusercart = function(data,callback){
  // Check that email is filled out
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the email
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('users',email+'.json',function(err,data){
          if(!err && data){
            callback(200, data.cart || {});
          } else {
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

// Required param: email
// Optional data: none
usermethods.getuserorders = function(data,callback){
  // Check that email is filled out
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  if(email){
    // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the email
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('users',email+'.json',function(err,data){
          if(!err && data){
            callback(200, data.orders || {});
          } else {
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


// Required params: email, orderid
// Optional data: none
usermethods.getuserorder = function(data,callback){
  // Check that email and orderId are filled out
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
  var orderId = typeof(data.queryStringObject.orderid) == 'string' && data.queryStringObject.orderid.trim().length > 0 ? data.queryStringObject.orderid.trim() : false;    
  if(email && orderId){
    // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the email
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('users',email+'.json',function(err,data){
          if(!err && data){
            if(data.orders.includes(orderId)){
                    _data.read('orders',orderId+'.json',function(err,data){
                        if(!err && data){
                            callback(200,data);
                        }else{
                            callback(404,{"Error" : "Could not open the order file."});                
                        }
                    });
            }else{
                callback(500,{"Error" : "The given order is unknowned for the user."})
            }
          } else {
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





// Required data: email,
// Optional data: name, phone, password, street, cc(credit card)
usermethods.updateuser = function(data,callback){  
  // Check that all required fields are filled out
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var name = typeof(data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name.trim() : false;
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
  var cc = typeof(data.payload.cc) == 'string' && data.payload.cc.trim().length > 0 ? data.payload.cc.trim() : false;    
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var street = typeof(data.payload.street) == 'string' && data.payload.street.trim().length > 0 ? data.payload.street.trim() : false;
    
  if(email && (name || phone || password || street)){
    // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the email
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('users',email+'.json',function(err,data){
          if(!err && data){
                if(password)
                   data.password = util.hash(password);
                if(name)
                    data.name = name;
                if(street)
                    data.street = street;
                if(phone)
                    data.phone = phone;
                if(cc)
                    data.cc = cc;
                _data.update('users',email+'.json', data,function(err,data){
                    if(!err){
                      callback(200, {'message' : 'Update done.'});
                    } else {
                      callback(500,{'Error' : 'Not able to do the update.'});
                    }
                });
          } else {
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


// Required param: email,
// Optional data: none
usermethods.deleteuser = function(data,callback){  
  // Check that all required fields are filled out
  var email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
    
  if(email){
    // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the email
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
          // delete the current token
          _data.delete('tokens',token+'.json',function(err){
              if(!err){
                // Lookup the user
                _data.delete('users',email+'.json',function(err){
                  if(!err){
                    callback(200,{'msg' : 'User has been deleted'});
                  } else {
                    callback(500,{'Error' : 'Could not delete the specified user'});
                  }
                });
              } else {
                callback(500,{'Error' : 'Could not delete the specified token'});
              }
         });  
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



// Export the module
module.exports = usermethods;