const mysql = require("mysql");
const mysqlPool = require("../mysql-pool");
const bcrypt = require("bcrypt");

function getRooms(request, response) {
  var query = mysql.format("SELECT * FROM room");
  mysqlPool.query(query, (error, rows) => {
    if (error) {
      response.json({ message: "Ocorreu um erro.", error: error.stack });
    } else {
      response.json({ message: "Salas obtidas com sucesso.", rooms: rows });
    }
  });
}

function getRoomByName(request, response) {
  var roomName = request.params.roomName;
  var query = mysql.format("SELECT * FROM room WHERE name = ?", [roomName]);

  mysqlPool.query(query, (error, rows) => {
    if (error) {
      response.json({ message: "Ocorreu um erro.", error: error.stack });
    } else if (rows.length) {
      response.json({ message: "Sala obtida com sucess.", room: rows });
    } else {
      response.status(404).json({ message: "A sala não existe." });
    }
  });
}

function createRoom(request, response) {
  var name = request.body.name;
  var isPrivate = request.body.isPrivate;
  var password = request.body.password;

  if (name && isPrivate != null) {
    mysqlPool.query(
      mysql.format("SELECT * FROM room WHERE name = ?", [name]),
      (error, rows) => {
        if (error) {
          response.json({ message: "Ocorreu um erro.", error: error.stack });
        } else if (rows.length) {
          response.status(409).json({ message: "A sala já foi registada." });
        } else {
          if (isPrivate === true) {
            if (password) {
              bcrypt.hash(password, 10, (error, hash) => {
                if (error) {
                  response.json({
                    message: "Ocorreu um erro.",
                    error: error.stack,
                  });
                } else {
                  mysqlPool.query(
                    mysql.format(
                      "INSERT INTO room (name, private, password) VALUES (?, ?, ?)",
                      [name, isPrivate, hash]
                    ),
                    (error, rows) => {
                      if (error) {
                        response.json({
                          message: "Ocorreu um erro.",
                          error: error.stack,
                        });
                      } else {
                        response.json({
                          message: "Sala criada com sucesso",
                          room: {
                            id: rows[0].id,
                            name: name,
                            private: isPrivate,
                            password: password,
                          },
                        });
                      }
                    }
                  );
                }
              });
            } else {
              response
                .status(400)
                .json({ message: "The password is missing." });
            }
          } else {
            mysqlPool.query(
              mysql.format("INSERT INTO room (name, private) VALUES (?, ?)", [
                name,
                isPrivate,
              ]),
              (error, rows) => {
                if (error) {
                  response.json({
                    message: "Ocorreu um erro.",
                    error: error.stack,
                  });
                } else {
                  response.json({
                    message: "Sala criada com sucesso.",
                    room: {
                      id: rows.id,
                      name: name,
                      private: isPrivate,
                    },
                  });
                }
              }
            );
          }
        }
      }
    );
  } else {
    response
      .status(400)
      .json({ message: "O nome ou visibilidade da sala está em falta." });
  }
}

function enterRoom(request, response) {
  var userId = request.body.userId;
  var roomName = request.body.roomName;
  var password = request.body.password;

  if (roomName) {
    mysqlPool.query(
      mysql.format("SELECT * FROM room WHERE name = ?", [roomName]),
      (error, rows) => {
        if (error) {
          response.json({ message: "Ocorreu um erro.", error: error.stack });
        } else {
          if (rows.length) {
            var roomId = rows[0].id;
            var privateRoom = rows[0].private;
            var roomPassword = rows[0].password;

            mysqlPool.query(
              mysql.format(
                "SELECT user_id FROM room_member WHERE room_id = ? AND user_id = ?",
                [roomId, userId]
              ),
              (error, rows) => {
                if (error) {
                  response.json({
                    message: "Ocorreu um erro.",
                    error: error.stack,
                  });
                } else if (rows.length) {
                  response
                    .status(409)
                    .json({ message: "O utilizador já está na sala" });
                } else {
                  if (privateRoom) {
                    if (password) {
                      bcrypt.compare(
                        password,
                        roomPassword,
                        (error, result) => {
                          if (error) {
                            response.json({
                              message: "Ocorreu um erro.",
                              error: error.stack,
                            });
                          } else if (result) {
                            mysqlPool.query(
                              mysql.format(
                                "INSERT INTO room_member (room_id, user_id) VALUES (?, ?)",
                                [roomId, userId]
                              ),
                              (error, rows) => {
                                if (error) {
                                  response.json({
                                    message: "Ocorreu um erro.",
                                    error: error.stack,
                                  });
                                } else {
                                  response.json({
                                    message: "Entrada na sala com sucesso.",
                                    member: {
                                      memberId: rows.id,
                                      roomId: roomId,
                                      userId: userId,
                                    },
                                  });
                                }
                              }
                            );
                          } else {
                            response.json({ message: "Password errada." });
                          }
                        }
                      );
                    } else {
                      response
                        .status(400)
                        .json({ message: "A password da sala está em falta." });
                    }
                  } else {
                    mysqlPool.query(
                      mysql.format(
                        "INSERT INTO room_member (room_id, user_id) VALUES (?, ?)",
                        [roomId, userId]
                      ),
                      (error, rows) => {
                        if (error) {
                          response.json({
                            message: "Ocorreu um erro.",
                            error: error.stack,
                          });
                        } else {
                          response.json({
                            message: "Entrada na sala com sucesso.",
                            member: {
                              memberId: rows.id,
                              roomId: roomId,
                              userId: userId,
                            },
                          });
                        }
                      }
                    );
                  }
                }
              }
            );
          } else {
            response.json({ message: "A sala não existe." });
          }
        }
      }
    );
  } else {
    response.status(400).json({ message: "O nome da sala está em falta." });
  }
}

function getRoomMembers(request, response) {
  var roomId = request.params.roomId;

  mysqlPool.query(
    mysql.format(
      "SELECT user.username FROM room_member JOIN user ON user.id = room_member.user_id WHERE room_member.room_id = ?",
      [roomId]
    ),
    (error, rows) => {
      if (error) {
        response.json({ message: "Ocorreu um erro.", error: error.stack });
      } else {
        response.json({
          message: "Membros obtidos com sucesso.",
          members: rows,
        });
      }
    }
  );
}

function getUserRooms(request, response) {
  var userId = request.params.userId;
  var query = mysql.format(
    "SELECT room.name FROM room_member JOIN room ON room.id = room_member.room_id WHERE room_member.user_id = ?",
    [userId]
  );

  mysqlPool.query(query, (error, rows) => {
    if (error) {
      response.json({ message: "Ocorreu um erro.", error: error.stack });
    } else {
      response.json({
        message: "Utilizadores obtidos com sucesso.",
        userRooms: rows,
      });
    }
  });
}

/*MODULE EXPORT*/
module.exports.getRooms = getRooms;
module.exports.getRoomByName = getRoomByName;
module.exports.createRoom = createRoom;
module.exports.enterRoom = enterRoom;
module.exports.getRoomMembers = getRoomMembers;
module.exports.getUserRooms = getUserRooms;
