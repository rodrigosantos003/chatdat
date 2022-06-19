const mysql = require("mysql");
const mysqlPool = require("../mysql-pool");

function sendMessage(request, response) {
  var author = request.body.author;
  var author_color = request.body.author_color;
  var content = request.body.content;
  var date = request.body.date;
  var image = request.body.image;
  var roomId = request.body.roomId;
  var private = request.body.private;
  var target = request.body.target;

  var query;

  if (
    author &&
    author_color &&
    content &&
    date &&
    roomId &&
    private != undefined
  ) {
    if (private === true) {
      if (!target) {
        response.status(400).json({
          message: "O destinatário está em falta.",
        });
      }
    } else {
      target = null;
    }

    if (image) {
      query = mysql.format(
        "INSERT INTO message (author, author_color, content, date, image, room_id, private, target) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [author, author_color, content, date, image, roomId, private, target]
      );
    } else {
      query = mysql.format(
        "INSERT INTO message (author, author_color, content, date, room_id, private, target) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [author, author_color, content, date, roomId, private, target]
      );
    }

    mysqlPool.query(query, (error, rows) => {
      if (error) {
        response.json({
          message: "Ocorreu um erro.",
          error: error.stack,
        });
      } else {
        response.json({
          message: "Message sent successffuly.",
          sentMessage: {
            id: rows.id,
            author: author,
            author_color: author_color,
            content: content,
            date: date,
            image: image,
            roomId: roomId,
            private: private,
            target: target,
          },
        });
      }
    });
  } else {
    response.status(400).json({
      message: "Dados em falta",
    });
  }
}

function getRoomMessages(request, response) {
  var roomId = request.params.roomId;

  if (roomId) {
    mysqlPool.query(
      mysql.format("SELECT * FROM message WHERE room_id = ?", [roomId]),
      (error, rows) => {
        if (error) {
          response.json({ message: "An error occurred.", error: error.stack });
        } else if (rows.length) {
          response.json({
            message: "Messagens obtidas com sucesso.",
            messages: rows,
          });
        }
      }
    );
  }
}

/*MODULE EXPORT*/
module.exports.sendMessage = sendMessage;
module.exports.getRoomMessages = getRoomMessages;
