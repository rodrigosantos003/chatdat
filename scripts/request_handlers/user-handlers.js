const mysql = require("mysql");
const mysqlPool = require("../mysql-pool");
const passport = require("passport");
const bcrypt = require("bcrypt");

function login(request, response, next) {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      next(error);
    } else if (!user) {
      response.status(401);
      if (info) {
        response.json(info);
      } else {
        response.json({ message: "Unknown error." });
      }
    } else {
      request.login(user, (error) => {
        if (error) {
          next(error);
        } else {
          response.json({ message: "Sessão iniciada com sucesso.", user });
        }
      });
    }
  })(request, response, next);
}

function signup(request, response, next) {
  var username = request.body.username;
  var password = request.body.password;
  var color = request.body.color;

  if (username && password && color) {
    mysqlPool.query(
      mysql.format("select * from user where username = ?", [username]),
      (error, rows) => {
        if (error) {
          next(error);
        } else if (rows.length) {
          response
            .status(409)
            .json({ message: "O utilizador já foi registado." });
        } else {
          bcrypt.hash(password, 10, (error, hash) => {
            if (error) {
              next(error);
            } else {
              mysqlPool.query(
                mysql.format(
                  "insert into user (username, password, color) values (?, ?, ?)",
                  [username, hash, color]
                ),
                (error, rows) => {
                  if (error) {
                    next(error);
                  } else {
                    response.json({
                      message: "Conta criada com sucesso.",
                      user: {
                        id: rows.id,
                        username: username,
                        color: color,
                      },
                    });
                  }
                }
              );
            }
          });
        }
      }
    );
  } else {
    response.status(400).json({
      message: "O nome de utilizador, password ou cor está em falta.",
    });
  }
}

function logout(request, response) {
  request.logout((error) => {
    if (error) {
      return next(error);
    } else {
      response.json({ message: "Fim da sessão com sucesso." });
    }
  });
}

function verifyLogin(request, response) {
  if (request.user) {
    response.json({ message: "Utilizador loggado.", user: request.user });
  } else {
    response.json({ message: "Nenhum utilizador loggado." });
  }
}

/*MODULE EXPORT*/
module.exports.login = login;
module.exports.signup = signup;
module.exports.logout = logout;
module.exports.verifyLogin = verifyLogin;
