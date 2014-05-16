//
//  errors.js
//  gb-api
//
//  Created by Luka Mirosevic on 17/04/2014.
//  Copyright (c) 2014 Goonbee. All rights reserved.
//

//lm subsequent stack traces don't seem to show up

var _ = require('underscore');
    clc = require('cli-color');

var errorTypes = module.exports.errorTypes = {};

var P = function() {
  var _errorMapper = function(input) { return input; };

  this.makeError = function(type) {
    var NewError = function () {
      var tmp = Error.apply(this, arguments);
      tmp.name = this.name = type;
      this.stack = tmp.stack;
      this.message = tmp.message;

      return this;
    };
    var IntermediateInheritor = function() {};
    IntermediateInheritor.prototype = Error.prototype;
    NewError.prototype = new IntermediateInheritor();

    errorTypes[type] = NewError;
  };

  this.shouldLogOutput = false;

  this.shouldLogCalls = false;

  this.shouldLogErrors = false;

  this.logRed = function(string) { return console.log(clc.red(string)); };

  this.logBlue = function(string) { return console.log(clc.blue(string)); };

  this.logPlain = function(string) { return console.log(string); };

  this.logCallName = function(string) { return console.log('>>> ' + clc.blue(string)); };

  this.handleAndLogError = function(callback, err) {
    var convertedError = p.getErrorMapper(err);

    // log error
    if (errors.getShouldLogErrors()) {
      // log the output to the console (in this case a trift error object)
      p.logPlain(convertedError);

      // log a stack track
      if (!_.isUndefined(err.stack)) {
        p.logRed(err.stack);
      }
      else {
        p.logRed(err + '\n    No stack track available.');
      }
    }

    // attempt to send error info to client
    callback.call(callback, errors.getErrorMapper(err));
  };

  this.getErrorMapper = function() {
    return _errorMapper;
  };

  this.setErrorMapper = function(errorMapper) {
    _errorMapper = errorMapper;
  };
};
var p = new P();

var errors = {
  setErrorMapper: p.setErrorMapper,
  getErrorMapper: p.getErrorMapper,
  setShouldLogOutput: function(shouldLogOutput) {
    p.shouldLogOutput = shouldLogOutput;
  },
  getShouldLogOutput: function() {
    return p.shouldLogOutput;
  },
  setShouldLogCalls: function(shouldLogCalls) {
    p.shouldLogCalls = shouldLogCalls;
  },
  getShouldLogCalls: function() {
    return p.shouldLogCalls;
  },
  setShouldLogErrors: function(shouldLogErrors) {
    p.shouldLogErrors = shouldLogErrors;
  },
  getShouldLogErrors: function() {
    return p.shouldLogErrors;
  },
  errorHandledAPI: function(apiObject) {
    return _.object(_.map(apiObject, function(originalFunction, callName) {
      return [callName, function() {
        var myArguments = arguments;
        var originalCallback = _.last(myArguments);
        var callbackArgumentIndex = _.max(_.keys(myArguments));

        myArguments[callbackArgumentIndex] = function(err, output) {
          // clean call
          if (_.isUndefined(err) || _.isNull(err)) {
            // log the output to the console
            if (errors.getShouldLogOutput()) p.logPlain(output);

            originalCallback(null, output); 
          }
          // callback style error
          else {
            p.handleAndLogError(originalCallback, err);
          }
        };

        try {
          // log the call name to the console
          if (errors.getShouldLogCalls()) p.logCallName(callName);

          // make the original call with the modified arguments
          originalFunction.apply(originalFunction, myArguments);
        }
        // throw style error
        catch (err) {
          p.handleAndLogError(originalCallback, err);
        }
      }];
    }));
  },
};
_.extend(module.exports, errors);

p.makeError('GenericError');
p.makeError('AuthenticationError');
