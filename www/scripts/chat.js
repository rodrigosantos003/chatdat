"use strict";

/**
 * Função que será executada quando a página de chat estiver toda carregada
 * @memberof window
 */
window.onload = function () {
  var currentRoom = JSON.parse(sessionStorage.getItem("currentRoom"));
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  document.getElementById("room-info-nav").innerHTML =
    currentUser.username + " - " + currentRoom[0].name;

  chatEvents();
  loadMessages();
  buildRoomsList();
};

var messages = []; //Mensagens da sala
var connectedUsers = []; //Utilizadores connectados

/**
 * Definição de eventos de chat
 */
function chatEvents() {
  var socket = io();
  var currentRoom = JSON.parse(sessionStorage.getItem("currentRoom"));
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  var chatMessages = document.getElementById("chat-messages");
  var form = document.getElementById("send-message");
  var input = document.getElementById("message-content-input");
  var userTypingDiv = document.getElementById("user-typing");
  var privateMessage = document.getElementById("isPrivateMessage");

  socket.emit(
    "join room",
    currentRoom[0].name,
    currentUser.username,
    socket.id
  );

  socket.on("join room", function (room, user, socketId) {
    console.log(`${user} joined the chat on ${room}`);

    connectedUsers.push(JSON.stringify({ user: user, socketId: socketId }));
    var joinElement = `<span class="col-12 text-center annoucements">${user} joined the chat on ${room}</span>`;
    chatMessages.insertAdjacentHTML("beforeend", joinElement);

    buildMembersList();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (input.value) {
      if (privateMessage.style.display == "block") {
        sendMessage(input.value, currentUser, currentRoom[0], true, socket);
        document.getElementById("isPrivateMessage").style.display = "none";
        document.getElementById("privateMessageTarget").innerHTML = "";
      } else {
        sendMessage(input.value, currentUser, currentRoom[0], false, socket);
      }

      userTypingDiv.innerHTML = "";
      input.value = "";
      clearImage();
    }
  });

  input.addEventListener("input", function () {
    socket.emit("user typing", currentRoom[0].name, currentUser.username);
  });

  input.addEventListener("focusout", function () {
    socket.emit("user not typing", currentRoom[0].name);
  });

  socket.on("user typing", function (room, user) {
    console.log(`${user} is typing...`);
    userTypingDiv.innerHTML = `${user} is typing...`;
  });

  socket.on("user not typing", function (room) {
    userTypingDiv.innerHTML = "";
  });

  socket.on("public message", function (room, message) {
    var messageElement = createMessageElement(message, currentUser);
    chatMessages.insertAdjacentHTML("beforeend", messageElement);
    chatMessages.scrollTo(0, chatMessages.scrollHeight);

    socket.emit("public notification", room, message);
  });

  socket.on("private message", function (socketId, message) {
    var messageElement = createMessageElement(message, currentUser);
    chatMessages.insertAdjacentHTML("beforeend", messageElement);
    chatMessages.scrollTo(0, chatMessages.scrollHeight);

    socket.emit("private notification", socketId, message);
  });

  socket.on("public notification", function (room, message) {
    messageNotification(message);
  });

  socket.on("private notification", function (socketId, message) {
    messageNotification(message);
  });

  socket.on("disconnect", function () {
    socket.emit("leave room", currentRoom[0].name, currentUser.username);
  });

  socket.on("leave room", function (room, user) {
    console.log(`${user} left the chat on ${room}`);

    var userSocket = connectedUsers.find(
      (connectedUser) => JSON.parse(connectedUser).user == user
    );

    var index = connectedUsers.indexOf(userSocket);
    connectedUsers.splice(index, 1);

    var leaveElement = `<span class="col-12 text-center annoucements">${user} left the chat on ${room}</span>`;
    chatMessages.insertAdjacentHTML("beforeend", leaveElement);
  });
}

/**
 * Função para construir dos membros da sala atual
 */
function buildMembersList() {
  var currentRoom = JSON.parse(sessionStorage.getItem("currentRoom"));
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  var url = "/room/" + currentRoom[0].id + "/members";
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var response = JSON.parse(this.responseText);
        if (response.members) {
          var roomMembers = response.members;

          var list = document.getElementsByClassName("modal-body")[0];
          list.innerHTML = "";

          roomMembers.forEach((member) => {
            let card = document.createElement("div");
            let memberName = document.createElement("span");
            let br = document.createElement("br");
            let sendMessageButton;

            if (member.username != currentUser.username) {
              sendMessageButton = document.createElement("a");
              sendMessageButton.setAttribute("role", "button");
              sendMessageButton.innerHTML = "Enviar Mensagem";
              sendMessageButton.className = "btn btn-dark text-white";

              sendMessageButton.setAttribute(
                "href",
                "javascript: sendPrivateMessage('" + member.username + "')"
              );
            }

            card.className = "card text-center p-3";

            memberName.innerHTML = member.username + " ";

            var isUserOnline = connectedUsers.find(
              (user) => JSON.parse(user).user == member.username
            );

            if (isUserOnline) {
              memberName.innerHTML = `${member.username} &#128994;`;
            }

            card.appendChild(memberName);
            if (sendMessageButton != null) card.appendChild(sendMessageButton);
            list.appendChild(card);
            list.appendChild(br);
          });
        }
      }
    }
  };
  xhr.send();
}

/**
 * Função para enviar mensagens
 * @param {string} content Conteúdo da mensagem
 * @param {json} user Utilizador que envia a mensagem
 * @param {json} room Sala onde se envia a mensagem
 * @param {boolean} privateMessage Indicador de mensagem privada
 * @param {socket} socket Socket para emissão de eventos
 */
function sendMessage(content, user, room, privateMessage, socket) {
  var date = new Date().toISOString().slice(0, 19).replace("T", " ");
  var imagePath = document.getElementById("selectedImage").src;
  var target = document.getElementById("privateMessageTarget").innerHTML;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/send-message");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var response = JSON.parse(this.responseText);
        if (response.sentMessage) {
          var message = response.sentMessage;
          messages.push(message);

          if (message.private === false) {
            socket.emit("public message", room.name, message);
          } else {
            var targetSocket = connectedUsers.find(
              (user) => JSON.parse(user).user == message.target
            );

            if (targetSocket) {
              var targetId = JSON.parse(targetSocket).socketId;
              socket.emit("private message", targetId, message);
            }
          }
        }

        socket.emit("user not typing", room.name);

        console.log(response.message);
      }
    }
  };

  var data;

  if (privateMessage == false) {
    data = {
      author: user.username,
      author_color: user.color,
      content: content,
      date: date,
      image: imagePath,
      roomId: room.id,
      private: privateMessage,
    };
  } else {
    data = {
      author: user.username,
      author_color: user.color,
      content: content,
      date: date,
      image: imagePath,
      roomId: room.id,
      private: privateMessage,
      target: target,
    };
  }

  xhr.send(JSON.stringify(data));
}

/**
 * Função para enviar uma mensagem privada
 * @param {string} targetName Nome do utilizador a enviar a mensagem privada
 */
function sendPrivateMessage(targetName) {
  document.getElementById("isPrivateMessage").style.display = "block";
  document.getElementById("privateMessageTarget").innerHTML = targetName;
  document.getElementById("closeMembersModal").click();
}

/**
 * Função para carregar as mensagens da BD
 */
function loadMessages() {
  var currentRoom = JSON.parse(sessionStorage.getItem("currentRoom"));
  var url = "/room/" + currentRoom[0].id + "/messages";

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var response = JSON.parse(this.responseText);
        if (response.messages) {
          messages = [];
          messages = response.messages;
          buildMessages();
        }
      }
    }
  };
  xhr.send();
}

/**
 * Função para construir as mensagens da sala
 */
function buildMessages() {
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  var chatMessages = document.getElementById("chat-messages");

  messages.forEach((message) => {
    var messageElement;

    if (message.target != null) {
      if (
        currentUser.username != message.author &&
        currentUser.username != message.target
      ) {
        messageElement = null;
      } else {
        messageElement = createMessageElement(message, currentUser);
      }
    } else {
      messageElement = createMessageElement(message, currentUser);
    }

    if (messageElement == null) return;
    chatMessages.insertAdjacentHTML("beforeend", messageElement);
  });

  chatMessages.scrollTo(0, chatMessages.scrollHeight);
}

/**
 * Função de carregamento de imagens
 * @param {Event} event Evento de carregamento de imagens
 */
function onFileUpload(event) {
  let file = event.target.files[0];
  let isImage = file["type"].split("/")[0] == "image";
  let selectedImage = document.getElementById("selectedImage");

  if (isImage) {
    selectedImage.classList = "";
    selectedImage.style.height = "20vh";
    selectedImage.style.top = "-20vh";
    var reader = new FileReader();
    selectedImage.title = file.name;

    reader.onload = function (event) {
      selectedImage.src = event.target.result;
    };

    reader.readAsDataURL(file);
  } else {
    alert("ERRO: Só pode enviar imagens!");
    clearImage();
  }
}

/**
 * Função para limpar o input de imagem
 */
function clearImage() {
  let input = document.getElementById("image-file");
  let selectedImage = document.getElementById("selectedImage");

  input.value = "";
  selectedImage.classList = "visually-hidden";
  selectedImage.removeAttribute("src");
}

function leaveChat() {
  var socket = io();
  var currentRoom = JSON.parse(sessionStorage.getItem("currentRoom"));
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  socket.emit("leave room", currentRoom[0].name, currentUser.username);

  window.open("./index.html", "_self");
}
