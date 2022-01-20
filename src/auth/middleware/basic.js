'use strict';

const base64 = require('base-64');
const { users } = require('../models');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) { return _authError(); }

  let basic = req.headers.authorization.split(' ').pop();
  if (basic.length > 20) _authError('Basic Credentials Expected');
  let [user, pass] = base64.decode(basic).split(':');

  try {
    req.user = await users.authenticateBasic(user, pass);
    next();
  } catch (e) {
    _authError('Invalid Login');
  }

  function _authError(text) {
    res.status(403).send(text);
  }

};
