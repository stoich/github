"use strict";
var https = require('https');

module.exports = class Connector {

  /**
   * Creates a connector instance
   * @param details - [object] description of connector - needs to be in a specific format
   * @param requestId - [string] id added to connector calls
   */
  constructor(details, requestId, apptalk) {
    this.details = details;
    this.requestId = requestId;
    this.apptalk = apptalk;

    this.httpsOptions = {
      host: this.baseUrl,
      path: '/prod',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }

  /**
   * Sends a message with parameters to the connector
   * @param messageName - [string] the message we want to send (ex. 'is_url')
   * @param properties - [object] the parameters we want to send in the format: {propertyName: 'someValue', otherProperty: 'otherValue' }
   * @returns {Promise} - resolves to [string] holding the API's json reponse
   */
  sendMessage(messageName, properties) {

    var _this = this;
    var properties = properties || {};

    var propertiesAsString = JSON.stringify(properties);

    var body = `[ { "id": "${this.requestId}",
         "header": { "message": "${messageName}" },
          "body":  ${propertiesAsString} }]`;

    return new Promise(function (resolve, reject) {

      _this.apptalk(JSON.parse(body), {}, function (err, results) {
        resolve(JSON.stringify(results));
      })

    });
  }

  /**
   * Builds the anticipated message response generated for valid input values
   * @param expectedValues - [object] the anticipated output property values in format {propertyName: 'someValue'}
   * @returns [String] - the anticipated message output in json format
   */
  buildValidOutput(expectedValues) {

    var response = [
      {
        "id": this.requestId,
        "header": {},
        "body": expectedValues
      }];

    return JSON.stringify(response);
  }

  /**
   * Builds the anticipated message response when call is missing required properties
   * @param messageName - [string] name of message to be called
   * @returns [String] - the anticipated message output in json format
   */
  buildMissingParametersOutput(messageName) {

    var required = this.getRequiredParameters(messageName);
    var body = {
      "code": "invalid_input",
      "message": `The following required parameters are missing: ${required}`
    };

    var response = [
      {
        "id": this.requestId,
        "header": {"error": true},
        "body": body
      }];

    return JSON.stringify(response);

  }

  /**
   * Gets the required input parameters for a specific message in this connector instance
   * @param messageName - [string] name of the message in current connector instance
   * @returns [string] - comma and whitespace separated list of required properties
   */
  getRequiredParameters(messageName) {
    var messages = this.details[0]['messages'];

    var currentMessage = messages.find(msg => msg.name === messageName);

    return currentMessage['input_schema']['required'].join(', ');
  }

}
