var Connector = require('./connector');
var assert = require('assert');
var path = require('path');

var fs = require('fs');

module.exports = {

  execute: function (connectorName, apptalk) {

    var connectorDetails = JSON.parse(fs.readFileSync('connectors.json'));
    var connector = new Connector(connectorDetails, "123-def", apptalk);
    var connectorFolder = `./connectors/${connectorName}`;

    var messages = this.getMessages(connectorFolder);

    this.checkAllMessagesEmptyInput(connector, messages)
  },

  getMessages: function (srcpath) {

    return fs.readdirSync(srcpath).filter(function (file) {
      return fs.statSync(path.join(srcpath, file)).isDirectory();
    });

  },

  checkAllMessagesEmptyInput: function (connector, messages) {
    _this = this;
    var promises = [];

    for (var i = 0; i < messages.length; i++) {
      promises.push(connector.sendMessage(messages[i], {}));
    }


    Promise.all(promises).then(reponses => {

      for (var i = 0; i < reponses.length; i++) {
        var msg = messages[i];
        var expected = connector.buildMissingParametersOutput(msg);
        var actual = reponses[i];
        _this.checkOutputMatch(msg, expected, actual);
      }

    });
  },

  checkOutputMatch: function (message, expected, actual) {

    if (actual !== expected) {
      console.log(`\nPROBLEM FOR: ${message}`);
      console.log("<EXPECTED>: " + expected);
      console.log("<ACTUALLY>: " + actual);
    }

  }

};
