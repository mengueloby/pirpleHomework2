/*
 * Library to create, read , edit any kind of file storing our data or logs.
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');
var helpers = require('./utils');

// Container for module (to be exported)
var serializer = {};

// Base directory of data folder
serializer.baseDir = path.join(__dirname,'./../data/');

// Write data to a file
serializer.create = function(dir,file,data,callback){
  // Open the file for writing
  fs.open(serializer.baseDir+dir+'/'+file, 'wx', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string if needed
      var stringData =   typeof(data) == 'object' ?  JSON.stringify(data) : data;

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData,function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist');
    }
  });
};

// Read data from a file
serializer.read = function(dir,file,callback){
  fs.readFile(serializer.baseDir+dir+'/'+file, 'utf8', function(err,data){
    if(!err && data){
      var parsedData = helpers.parseJsonToObject(data);
      callback(false,parsedData);
    } else {
      callback(err,data);
    }
  });
};

// Update data in a file
serializer.update = function(dir,file,data,callback){
  // Open the file for writing
  fs.open(serializer.baseDir+dir+'/'+file, 'r+', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string if needed
      var stringData =   typeof(data) == 'object' ?  JSON.stringify(data) : data;

      // Truncate the file
      fs.truncate(fileDescriptor,function(err){
        if(!err){
          // Write to file and close it
          fs.writeFile(fileDescriptor, stringData,function(err){
            if(!err){
              fs.close(fileDescriptor,function(err){
                if(!err){
                  callback(false);
                } else {
                  callback('Error closing existing file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Could not open file for updating, it may not exist yet');
    }
  });

};

// Append a string to a file. Create the file if it does not exist
serializer.append = function(dir,file,data,callback){
  // Open the file for appending
  fs.open(serializer.baseDir+dir+'/'+file, 'a', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string if needed
      var str =   typeof(data) == 'object' ?  JSON.stringify(data) : data;        
      // Append to file and close it
      fs.appendFile(fileDescriptor, str+'\n',function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing file that was being appended');
            }
          });
        } else {
          callback('Error appending to file');
        }
      });
    } else {
      callback('Could open file for appending');
    }
  });
};

// Delete a file
serializer.delete = function(dir,file,callback){
  // Unlink the file from the filesystem
  fs.unlink(serializer.baseDir+dir+'/'+file, function(err){
    callback(err);
  });

};

// List all the items in a directory
serializer.list = function(dir,callback){
  fs.readdir(serializer.baseDir+dir+'/', function(err,data){
    if(!err && data && data.length > 0){
      var trimmedFileNames = [];
      data.forEach(function(fileName){
        var ext=fileName.substr(fileName.lastIndexOf('.'),fileName.length);  
        trimmedFileNames.push(fileName.replace('.json','').replace('.log','').replace('.gz','').replace('.b64',''));
      });
      callback(false,trimmedFileNames);
    } else {
      callback(err,data);
    }
  });
};

// Test if a directory is empty
serializer.isemptyDir = function(dir){
  fs.readdir(serializer.baseDir+dir+'/', function(err,data){
    if(!err && data){
      if(data.length > 0)
          return data.length;
      else
        return 0;         
      
    } else {
      return -1;
    }
  });
};

// Export the module
module.exports = serializer;
