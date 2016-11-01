var Falafel = require('@trayio/falafel');
var testRunner = require('./test/testRunner');

// Set up the lambda function by wrapping the current directory
var apptalk = new Falafel().wrap({
  directory: __dirname + '/'
});

// Export the apptalk lambda function
exports.apptalk = apptalk;

testRunner.execute('github', apptalk);


