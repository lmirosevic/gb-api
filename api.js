//
//  api.js
//  gb-api
//
//  Created by Luka Mirosevic on 16/05/2014.
//  Copyright (c) 2014 Goonbee. All rights reserved.
//

var thrift = require('thrift'),
    errors = require('./errors');
    
module.exports = {
  createThriftServer: function(thriftService, api) {
    return thrift.createServer(thriftService, errors.errorHandledAPI(api));
  },

  errors: errors
};
