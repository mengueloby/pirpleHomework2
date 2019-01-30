/*
 * Create and export configuration variables
 *
 */



// Determine which environment was passed as a command-line argument
var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : 'staging';

// Container for all environments
var environments = {};

var applocale = typeof(process.env.NODE_LOC) == 'string' ? process.env.NODE_LOC.toLowerCase() : '';

var enmode={
    'staging': {
        'en' : 'staging',
        'fr': 'developpement'
    },
    'production': {
        'en' : 'production',
        'fr': 'production'
    }
}


// Locale management
var languages=[];
languages['en']={
    'server_on' : 'The server is running on port ',
    'server_mode' : ' in '+enmode[currentEnvironment]['en']+' mode',
    'greatings' : 'Hello world!!'
};
languages['fr']={
    'server_on' : 'Le serveur tourne sur le port ',
    'server_mode' : ' en mode '+enmode[currentEnvironment]['fr'],
    'greatings' : 'Bonjour le monde!!'
};




// Staging (default) environment
environments.staging = {
  'applocale': typeof(languages[applocale]) == 'object' ? applocale : 'en',    
  'locale' : languages,    
  'httpPort' : 3000,
  'envName' : 'staging',
  'hashingSecret' : 'thisIsASecret',
  'stripe' : {
      'secretKey' : 'your key' 
  },
  'mailgun': {
       'secretKey' : 'api:yourkey',
       'apiemail' : 'yourapiemail@test.org'
  }    
};

// Production environment
environments.production = {
  'applocale': typeof(languages[applocale]) == 'object' ? applocale : 'en',    
  'locale' : languages,    
  'httpPort' : 5000,
  'envName' : 'production',
  'hashingSecret' : 'thisIsASecret',
  'stripe' : {
      'secretKey' : 'your key' 
  },
  'mailgun': {
       'secretKey' : 'api:yourkey',
       'apiemail' : 'yourapiemail@test.org'
  }    
};



// Check that the current environment is one of the environments above, if not default to staging
var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;