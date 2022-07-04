"use strict";

const mysql = require("mysql");
const options = require("./connection-options.json");

const pool = mysql.createPool(options);

module.exports = pool;
