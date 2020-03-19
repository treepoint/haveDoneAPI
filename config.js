"use strict";

const mysql = require("mysql");
const path = require("path");

module.exports = {
  name: "haveDoneAPI",
  hostname: "http://localhost/api/",
  version: "0.5.1",
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  db: {
    get: mysql.createConnection({
      host: "192.168.0.99",
      port: "3306",
      user: "testHaveDone",
      password: "test",
      database: "test_haveDoneDB"
    })
  },
  jwt: {
    secret: "&@$!changeme!$@&",
    refreshSecret: "&@$!changememe!$@&",
    expiresIn: "4320m",
    refreshExpiresIn: "5760m"
  },
  uploadFilesDirectory: path.join(__dirname, "../haveDoneFiles/files")
};
