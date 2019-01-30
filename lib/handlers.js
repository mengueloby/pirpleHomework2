/*
 * Request Handlers
 *
 */

// Dependencies
var _user = require('./coreentity/usermethods');
var _tokenizer = require('./coreentity/tokenizer');
var _menu = require('./coreentity/pizzamethods');
var utils = require('./utils');
var config = require('./config');

// Define all the handlers
var handler = {};

// Not-Found
handler.notFound = function(data,callback){
  callback(404);
};

handler.apimethods = {
        'methods' : [
            {
                'name' : 'getapi',
                'verb' : 'get'
            },
            {
                'name' : 'getuser',
                'verb' : 'get'
            },
            {
                'name' : 'getuserfull',
                'verb' : 'get'
            },
            {
                'name' : 'getusercart',
                'verb' : 'get'
            },
            {
                'name' : 'getuserorder',
                'verb' : 'get'
            },
            {
                'name' : 'getuserorders',
                'verb' : 'get'
            },
            {
                'name' : 'getmenus',
                'verb' : 'get'
            },
            {
                'name' : 'updateuser',
                'verb' : 'put'
            },            
            {
                'name' : 'addcart',
                'verb' : 'put'
            },            
            {
                'name' : 'removecart',
                'verb' : 'put'
            },
            {
                'name' : 'deleteuser',
                'verb' : 'get'
            },
            {
                'name' : 'logout',
                'verb' : 'get'
            },
            {
                'name' : 'login',
                'verb' : 'post'
            },
            {
                'name' : 'register',
                'verb' : 'post'
            },
            {
                'name' : 'makeorder',
                'verb' : 'post'
            }
        ]
    }




// api
handler.api = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,handler.apimethods);
  } else {
    callback(405);
  }
};

handler.help = function(data,callback){
  var acceptableMethods = ['getapi','getuser','getuserfull', 'getusercart', 'getuserorder', 'getuserorders', 'getmenus','updateuser', 'addcart', 'removecart', 'deleteuser', 'logout', 'login', 'register', 'makeorder'];
  var apimethod = '';    
  if(data.method == 'get')
    apimethod = typeof(data.queryStringObject.apimethod) == 'string' && data.queryStringObject.apimethod.trim().length > 0 ? data.queryStringObject.apimethod.trim() : ' ';    
  if(acceptableMethods.indexOf(apimethod) > -1){
    handler._help[apimethod](data,callback);
  } else {
      // handler.notFound();
    callback(405);
  }
};

handler.rest = function(data,callback){
  var acceptableMethods = ['getapi','getuser','getuserfull', 'getusercart', 'getuserorder', 'getuserorders', 'getmenus','updateuser', 'addcart', 'removecart', 'deleteuser', 'logout', 'login', 'register', 'makeorder'];
  var apimethod = '';    
  if(data.method == 'get' || data.method == 'delete')
    apimethod = typeof(data.queryStringObject.apimethod) == 'string' && data.queryStringObject.apimethod.trim().length > 0 ? data.queryStringObject.apimethod.trim() : ' ';    
  else if(data.method == 'post' || data.method == 'put')
    apimethod = typeof(data.payload.apimethod) == 'string' && data.payload.apimethod.trim().length > 0 ? data.payload.apimethod.trim() : ' ';          
  if(acceptableMethods.indexOf(apimethod) > -1){
    handler._methods[apimethod](data,callback);
  } else {
      // handler.notFound();
    callback(405);
  }
};

// Container for all the users methods
handler._methods  = {};

handler._methods.getapi = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,handler.apimethods);
  } else {
    callback(405);
  }
};
handler._methods.getuser = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _user.getuser(data,callback);
  } else {
    callback(405);
  }
};
handler._methods.getuserfull = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _user.getuserfull(data,callback);
  } else {
    callback(405);
  }
};
handler._methods.updateuser = function(data,callback){
  var acceptableVerbs = ['put'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _user.updateuser(data,callback);
  } else {
    callback(405);
  }
};
handler._methods.deleteuser = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _user.deleteuser(data,callback);
  } else {
    callback(405);
  }
};
handler._methods.getusercart = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _user.getusercart(data,callback);
  } else {
    callback(405);
  }
};
handler._methods.getuserorders = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _user.getuserorders(data,callback);
  } else {
    callback(405);
  }
};
handler._methods.getuserorder = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _user.getuserorder(data,callback);
  } else {
    callback(405);
  }
};

handler._methods.getmenus = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _menu.getmenus(data,callback);
  } else {
    callback(405);
  }
};

handler._methods.register = function(data,callback){
  var acceptableVerbs = ['post'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _user.register(data,callback);
  } else {
    callback(405);
  }
};

handler._methods.login = function(data,callback){
  var acceptableVerbs = ['post'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _tokenizer.login(data,callback);
  } else {
    callback(405);
  }
};

handler._methods.addcart = function(data,callback){
  var acceptableVerbs = ['put'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _tokenizer.addcart(data,callback);
  } else {
    callback(405);
  }
};
handler._methods.removecart = function(data,callback){
  var acceptableVerbs = ['put'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _tokenizer.removecart(data,callback);
  } else {
    callback(405);
  }
};
handler._methods.makeorder = function(data,callback){
  var acceptableVerbs = ['put'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _tokenizer.makeorder(data,callback);
  } else {
    callback(405);
  }
};


handler._methods.logout = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    _tokenizer.logout(data,callback);
  } else {
    callback(405);
  }
};





















































// Container for all the user decription methods
handler._help  = {};

handler._help.getapi = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to get the list of methods allowed by this api", "restmethods" : ["get"], "params" : {}, "payload" : {}, "header":{}, "response":[{"status":200, "response description": "list of method allowed by the api."}, {"status":405, "response description": ""}]});
  } else {
    callback(405);
  }
};
handler._help.getuser = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to get the name, phone, street of a user", "restmethods" : ["get"], "params" : {"email" : "string", "apimethod":"string"}, "payload" : {}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};
handler._help.getuserfull = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to get the full information of a user", "restmethods" : ["get"], "params" : {"email" : "string", "apimethod":"string"}, "payload" : {}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};
handler._help.updateuser = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to update basic information of a user", "restmethods" : ["put"], "params" : {}, "payload" : {"email":"string", "password":"string, optional", "name":"string, optional", "street":"string, optional", "phone":"string, optional", "apimethod":"string"}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};
handler._help.deleteuser = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to delete a user", "restmethods" : ["get"], "params" : {"email" : "string", "apimethod":"string"}, "payload" : {}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};
handler._help.getusercart = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to get the cart of a user", "restmethods" : ["get"], "params" : {"email" : "string", "apimethod":"string"}, "payload" : {}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};
handler._help.getuserorders = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to get the list of a user orders", "restmethods" : ["get"], "params" : {"email" : "string", "apimethod":"string"}, "payload" : {}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};
handler._help.getuserorder = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to get a specific user order", "restmethods" : ["get"], "params" : {"email" : "string", "orderid":"string", "apimethod":"string"}, "payload" : {}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};

handler._help.getmenus = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to get the list of menus", "restmethods" : ["get"], "params" : {"email" : "string", "apimethod":"string"}, "payload" : {}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};

handler._help.register = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to register a user", "restmethods" : ["post"], "params" : {}, "payload" : {"email" : "string", "password":"string", "name":"string", "street":"string", "phone":"string, optional", "cc":"string, optional", "apimethod":"string"}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};

handler._help.login = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to login a user", "restmethods" : ["post"], "params" : {}, "payload" : {"email" : "string", "password":"string", "apimethod":"string"}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};

handler._help.addcart = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to add an item in the user cart", "restmethods" : ["put"], "params" : {}, "payload" : {"email" : "string", "pizza":"string", "quantity":"number", "apimethod":"string"}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};
handler._help.removecart = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to remove an item to the user cart", "restmethods" : ["put"], "params" : {}, "payload" : {"email" : "string", "pizza":"string", "apimethod":"string"}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};
handler._help.makeorder = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to make order for the current cart of an user", "restmethods" : ["put"], "params" : {}, "payload" : {"email" : "string", "apimethod":"string"}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};


handler._help.logout = function(data,callback){
  var acceptableVerbs = ['get'];
  if(acceptableVerbs.indexOf(data.method) > -1){
    callback(200,{"description" : "This method help you to logout a user", "restmethods" : ["get"], "params" : {"email" : "string", "apimethod":"string"}, "payload" : {}, "header":{"tokenid":"string"}, "response":[]});
  } else {
    callback(405);
  }
};










































// Export the handlers
module.exports = handler;
