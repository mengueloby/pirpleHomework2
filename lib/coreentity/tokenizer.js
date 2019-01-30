/*
* User action request handler 
*
*/

// Dependencies
var _data = require('./../serializer');
var util = require('./../utils');
var config = require('./../config');
var workers = require('./../workers');

// Define all the user action handler methods
var tokenizer = {};


//User login
// Required data: email, password
// Optional data: none
tokenizer.login = function(data,callback){
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if(email && password){
    if(util.isMail(email)){
        // Lookup the user who matches that email
        _data.read('users',email+'.json',function(err,userData){
          if(!err && userData){
                //verify if user is disconnected
                if(userData.isconnected == false){
                    
                    // Hash the sent password, and compare it to the password stored in the user object
                    var hashedPassword = util.hash(password);
                    if(hashedPassword == userData.hashedPassword){
                      // If valid, create a new token with a random name. Set an expiration date 30 mins in the future.
                      var tokenId = util.createRandomString(20);
                      var tokenObject = {
                        'email' : email,
                        'id' : tokenId,
                        'expires' : Date.now() + 1000 * 60 * 30  
                    };
                    userData.isconnected=true;
                    _data.update('users',email+'.json',userData,function(err){
                        if(!err){
                              // Store the token
                              _data.create('tokens',tokenId+'.json',tokenObject,function(err){
                                if(!err){
                                    workers.log('login', email, 'login', 200);
                                  callback(200,{"tokenIdnid" : tokenObject.id});
                                } else {
                                    workers.log('login', email, 'login', 500);
                                  callback(500,{'Error' : 'Could not create the new token'});
                                }
                              });                
                        } else {
                          callback(500,{'Error' : 'Could not update user to connected'});
                        }
                    });
                }else{
                  callback(400,{'Error' : 'Password did not match the specified user\'s stored password'});  
                }
            } else {
              callback(500,{'Error' : 'User already connected. Could not create the new token'});
            }
          } else {
            callback(400,{'Error' : 'Could not find the specified user.'});
          }
        });    
    }else {
        callback(400,{'Error' : 'Invalid mail.'});
    }  
    
  } else {
    callback(400,{'Error' : 'Missing required field(s).'})
  }
};









// User adding an item in the cart
// Required data: email, pizza name, quantity
// Optional data: none
tokenizer.addcart = function(data,callback){
  // Check that all required fields are filled out
  var pizza = typeof(data.payload.pizza) == 'string' && data.payload.pizza.trim().length > 0 ? data.payload.pizza.trim() : false;
  var quantity = typeof(data.payload.quantity) == 'number' && data.payload.quantity > 0 ? data.payload.quantity : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;  
  if(pizza && email && quantity){
  // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the phone number
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('users',email+'.json',function(err,data){
          if(!err && data){
                var userData=data;
              _data.read('menus','pizzalist.json',function(err,data){
                  if(!err && data){
                    var test = false;
                    var i=0;  
                    while(test == false && i < data.list.length){
                        if(data.list[i].pizza == pizza)
                            test=true;
                        else
                            i++;     
                    }  
                    if(test==true){
                        var price=data.list[i].price;
                        test = false;
                        i=0;  
                        while(test == false && i < userData.cart.length){
                            if(userData.cart[i].pizza == pizza)
                                test=true;
                            else
                                i++;     
                        }   
                        if(test==true){
                            userData.cart[i].quantity = userData.cart[i].quantity + quantity;
                            userData.cart[i].amount = userData.cart[i].quantity * price;
                        }else{
                            userData.cart.push({"pizza": pizza, "amount": price * quantity, "quantity": quantity});
                        } 
                          // Store the user
                         _data.update('users',email+'.json',userData,function(err){
                                if(!err){
                                  callback(200, userData.cart);
                                } else {
                                  callback(500,{'Error' : 'Could not add the new item.'});
                                }
                          });
                    }else{
                        callback(400,{'Error' : 'Unknowned pizza.'});    
                    }
                  } else {
                    callback(400,{'Error' : 'Could not find the menu\'s file.'});
                  }
              });
          } else {
            // User alread exists
            callback(400,{'Error' : 'A user with that email doesn\'t exist'});
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
    callback(400,{'Error' : 'Missing required fields'});
  }
};

// User removing an item in the cart
// Required data: email, pizza name
// Optional data: none
tokenizer.removecart = function(data,callback){
  // Check that all required fields are filled out
  var pizza = typeof(data.payload.pizza) == 'string' && data.payload.pizza.trim().length > 0 ? data.payload.pizza.trim() : false;
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;  
  if(pizza && email){
  // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the phone number
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read(
            'users',email+'.json',function(err,data){
          if(!err && data){
                var userData=data;
              _data.read('menus','pizzalist.json',function(err,data){
                  if(!err && data){
                    var test = false;
                    var i=0;  
                    while(test == false && i < userData.cart.length){
                        if(userData.cart[i].pizza == pizza)
                            test=true;
                        else
                            i++;     
                    }   
                    if(test==true){
                        userData.cart.splice(i,1);
                        // Store the user
                        _data.update('users',email+'.json',userData,function(err){
                                if(!err){
                                  callback(200, userData.cart);
                                } else {
                                  callback(500,{'Error' : 'Could not remove the item.'});
                                }
                        });
                    }else{
                        callback(500,{'Error' : 'Could not remove item not present in the cart.'});
                    } 
                      
                  } else {
                    callback(400,{'Error' : 'Could not find the menu\'s file.'});
                  }
              });
          } else {
            // User alread exists
            callback(400,{'Error' : 'A user with that email doesn\'t exist'});
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
    callback(400,{'Error' : 'Missing required fields'});
  }
};







// User making an order
// Required data: email
// Optional data: none
tokenizer.makeorder = function(data,callback){
  // Check that all required fields are filled out
  var email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;  
  if(email){
  // Get token from headers
    var token = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
    // Verify that the given token is valid for the phone number
    tokenizer.verifyToken(token,email,function(tokenIsValid, tokenData){
      if(tokenIsValid == 1){
        // Lookup the user
        _data.read('users',email+'.json',function(err,data){
          if(!err && data){
                var userData=data;
              if(userData.cart.length>0){
                  var amount=0;
                  userData.cart.forEach(function(item){
                      amount=amount+item.amount;
                  });
                  util.sendOrderPayment(amount, userData.cc, JSON.stringify(userData.cart), function(orderReturn){
                      if(orderReturn.status){
                          if(orderReturn.status == 200 || orderReturn.status == 201){
                            
                              var orderId = orderReturn.transId;//util.createRandomString(20);
                              var order={
                                  "email" : userData.email,
                                  "orderid" : orderId,
                                  "amount" : amount,
                                  "items" : userData.cart
                              };
                                // ceci doit être fait apres que l'api order ait renvoyé un ok 
                              _data.create('orders',orderId+'.json',order,function(err){
                                    if(!err){
                                        userData.cart=[];
                                         userData.orders.push(orderId);
                                        _data.update('users',email+'.json',userData,function(err){
                                            if(!err){
                                                // ceci est fait apres avoir envoyé un email
                                              util.sendOrderMail(email,order,function (mailDone){
                                                  if(mailDone == 1){
                                                    callback(200, {'message' : 'Order done.'});        
                                                  }else if(mailDone == 0){
                                                    callback(500,{'Error' : 'Order done but could send mail.'});        
                                                  }else{
                                                      callback(500,{'Error' : 'Order done but error trying to send mail.'});
                                                  } 
                                              });    
                                              //callback(200, {'message' : 'Order done.'});

                                            } else {
                                              callback(500,{'Error' : 'Order done but could not update the user cart.'});
                                            }
                                        });
                                    } else {
                                      callback(500,{'Error' : 'Order done but could not serialize the transaction '+orderId});
                                    }
                              });   
                          }else{
                            callback(500,{'Error' : 'Order not done: '+orderReturn.message});          
                          }
                      }else{
                        callback(500,{'Error' : 'Error trying to send order.'});    
                      }
                      
                  });
              }else{
                  callback(500,{'Error' : 'Could not make order for an empty cart.'});
              }
          } else {
            // User alread exists
            callback(400,{'Error' : 'A user with that email doesn\'t exist'});
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
    callback(400,{'Error' : 'Missing required fields'});
  }
};






// Tokens - user logout
// Required params: email
// Optional data: none
tokenizer.logout = function(data,callback){
   var email;
    if(data.method == 'get' || data.method == 'delete')
        email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 ? data.queryStringObject.email.trim() : false;
    else if(data.method == 'post' || data.method == 'put')
        email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 ? data.payload.email.trim() : false;   
    
   if(email){
        // Get token from headers
        var tokenid = typeof(data.headers.tokenid) == 'string' ? data.headers.tokenid : false;
        // Verify that the given token is valid for the user
        //tokenizer.verifyToken(tokenid,email,function(tokenIsValid){
          //if(tokenIsValid){   
              
              // Lookup the token
              _data.read('tokens',tokenid+'.json',function(err,tokenData){
                  if(!err && tokenData){
                      // verify if the token was generate by the user 
                     if(email == tokenData.email){                        
                         _data.read('users',email+'.json',function(err,userData){
                              if(!err && userData){
                                    //verify if user is connected
                                    if(userData.isconnected == true){
                                        userData.isconnected=false;
                                        //update user to disconnected
                                        _data.update('users',email+'.json',userData,function(err){
                                            if(!err){ 
                                                // Delete the token
                                                _data.delete('tokens',tokenid+'.json',function(err){
                                                  if(!err){
                                                    callback(200,{'msg' : 'User has been disconnected'});
                                                  } else {
                                                    callback(500,{'Error' : 'Could not delete the specified token'});
                                                  }
                                                });        
                                            } else {
                                              callback(500,{'Error' : 'Could not update user to disconnected'});
                                            }
                                        });
                                    }else{
                                      callback(500,{'Error' : 'User already disconnected'});  
                                    }               
                              } else {
                                callback(400,{'Error' : 'Could not find the specified user.'});
                              }
                          });
                     }else{
                        callback(403,{"Error" : "Token is invalid for the user."}); 
                     }
                  } else {
                    callback(400,{'Error' : 'Could not find the specified token.'});
                  }
              });
          //} else {
            //callback(403,{"Error" : "Missing required token in header, or token is invalid."})
          //}
        //});           
   }else{
        callback(400,{'Error' : 'Missing required field'});   
   }    
};

// Verify if a given token id is currently valid for a given user
tokenizer.verifyToken = function(id,email,callback){
  // Lookup the token
  _data.read('tokens',id+'.json',function(err,tokenData){
    if(!err && tokenData){
      // Check that the token is for the given user and has not expired        
      if(tokenData.email == email ){
           if(tokenData.expires > Date.now()){
               callback(1, tokenData);
          }else{
              // token expired
              callback(-2);
          }
      } else {
        // token not valid for the given user  
        callback(0);
      }
    } else {
      // error trying to read token  
      callback(-1);
    }
  });
};


// extend the validity of a token for 30 mins
tokenizer.extendToken = function(tokenData){
    tokenData.expires = Date.now() + 1000 * 60 * 30;
      _data.update('tokens',tokenData.id+'.json',tokenData,function(err){
            if(!err){
                  // nothing to do for the moment               
            } else {
              // nothing to do for the moment
            }                                                                               
      });
}



//export the module
module.exports = tokenizer;