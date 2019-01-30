/*
 * Worker-related tasks
 *
 */

 // Dependencies
var _data = require('./serializer');
var util = require('util');
var _data = require('./serializer');
var util = require('util');
var debug = util.debuglog('workers');
var _logs = require('./logs');

// Instantiate the worker module object
var workers = {};

// Lookup all tokens, get their data, if token expired, delete it and update the user to disconnected
workers.clearAllInvalidChecks = function(){
  // Get all the checks
  _data.list('tokens',function(err,tokens){
    if(!err && tokens && tokens.length > 0){
      tokens.forEach(function(token){
        // Read in the token data
        _data.read('tokens',token+'.json',function(err,tokenData){
          if(!err && tokenData){
            if(tokenData.expires <= Date.now()){               
                _data.read('users',tokenData.email+'.json',function(err,userData){
                      if(!err && userData){
                        if(tokenData.expires <= Date.now()){                            
                                userData.isconnected=false;
                                //update user to disconnected
                                _data.update('users',userData.email+'.json',userData,function(err){
                                    if(!err){ 
                                        
                                        _data.delete('tokens',token+'.json',function(err){
                                              if(!err){
                                                //nothing for the moment
                                                  
                                              } else {
                                                debug("Could not delete token "+token);
                                              }
                                        });
                                    } else {
                                      debug("Error updating user's connexion status: ",err);
                                    }
                                });
                        }
                      } else {
                        debug("Error reading one of the user's data: ",err);
                      }
                });
            }
          } else {
            debug("Error reading one of the token's data: ",err);
          }
        });
      });
    } else {
      debug('Error: No tokens to process');
    }
  });
};


// Timer to execute the worker-process once every ten minutes
workers.loop = function(){
  setInterval(function(){
    workers.clearAllInvalidChecks();
  },1000 * 60 * 10);
};



// Send check data to a log file
workers.log = function(file,user,method,status){
  // Form the log data
  var logData = {
    'filetofill' : file,
    'author' : user,
    'method' : method,
    'status' : status,
    'time' : Date.now()
  };

  // Convert the data to a string
  var logString = JSON.stringify(logData);

  // Determine the name of the log file
  var logFileName = file;

  // Append the log string to the file
  _logs.append(logFileName,logString,function(err){
    if(!err){
      debug("Logging to file succeeded");
    } else {
      debug("Logging to file failed");
    }
  });

};



// Rotate (compress) the log files
workers.rotateLogs = function(){
  // List all the (non compressed) log files
  _logs.list(false,function(err,logs){
    if(!err && logs && logs.length > 0){
      logs.forEach(function(logName){
        // Compress the data to a different file
        var logId = logName.replace('.log','');
        var newFileId = logId+'-'+Date.now();
        _logs.compress(logId,newFileId,function(err){
          if(!err){
            // Truncate the log
            _logs.truncate(logId,function(err){
              if(!err){
                debug("Success truncating logfile");
              } else {
                debug("Error truncating logfile");
              }
            });
          } else {
            debug("Error compressing one of the log files.",err);
          }
        });
      });
    } else {
      debug('Error: Could not find any logs to rotate');
    }
  });
};

// Timer to execute the log-rotation process once per day
workers.logRotationLoop = function(){
  setInterval(function(){
    workers.rotateLogs();
  },1000 * 60 * 60 * 24);
}


// Init script
workers.init = function(){

  // Send to console, in yellow
  console.log('\x1b[33m%s\x1b[0m','Background workers are running');

  // Execute all the checks immediately
  workers.clearAllInvalidChecks();

  // Call the loop so the checks will execute later on
  workers.loop();

};


 // Export the module
 module.exports = workers;
