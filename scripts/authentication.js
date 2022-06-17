"use strict";

const LocalStrategy = require("passport-local").Strategy;
const mysql = require("mysql");
const mysqlPool = require("./mysql-pool");
const bcrypt = require("bcrypt");

module.exports = function (passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    mysqlPool.query(
      mysql.format("select * from user where id = ?", [id]),
      (err, rows) => {
        if (err) {
          done(err);
        } else {
          delete rows[0].password;
          done(null, rows[0]);
        }
      }
    );
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true,
      },
      function (request, username, password, done) {
        mysqlPool.query(
          mysql.format("select * from user where username = ?", [username]),
          (err, rows) => {
            if (err) {
              done(err);
            } else if (!rows.length) {
              done(null, false, { message: "Utilizador não encontrado." });
            } else {
              bcrypt.compare(password, rows[0].password, (err, result) => {
                if (err) {
                  done(err);
                } else if (result) {
                  delete rows[0].password;
                  done(null, rows[0]);
                } else {
                  done(null, false, { message: "Password incorreta." });
                }
              });
            }
          }
        );
      }
    )
  );
};
