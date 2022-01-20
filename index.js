'use strict';

require('dotenv').config();
const app = require('./src/server.js');
const { db } = require('./src/auth/models');

const PORT = process.env.PORT || 3000;

db.sync()
  .then(() => app.start(PORT))
  .catch((e) => console.log(e));