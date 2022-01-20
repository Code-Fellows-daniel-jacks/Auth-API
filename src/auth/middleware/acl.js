'use strict';

module.exports = (capability) => {

  return (req, res, next) => {

    try {
      console.log(capability);
      if (req.user.capabilities.includes(capability)) {
        next();
      }
      else {
        _authError();
      }
    } catch (e) {
      next('Invalid Login');
    }

    function _authError() {
      res.status(403).send('Forbidden');
    }
  };
};