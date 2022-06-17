"use strict";

var rooms = [];
var roomMembers = [];
var selectedRoom;

/**
 * Função para criar uma sala
 */
function createRoom() {
  var name = document.getElementById("room-name").value;
  var isPrivate = document.getElementById("private-room").checked;
  var password = document.getElementById("room-password").value;

  var xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.open("POST", "/create-room");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        alert("Sala criada com sucesso");
      }
    }
  };

  xhr.send(JSON.stringify({ name, isPrivate, password }));
}

/**
 * Função para obter todas as salas
 */
function getRooms() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/rooms");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      var response = JSON.parse(this.responseText);
      if (this.status === 200) {
        if (response.rooms) {
          rooms = response.rooms;
        }
      }
    }
  };
  xhr.send();
}

/**
 * Função para obter os detalhes de uma sala através do nome
 * @param {string} roomName Nome da sala
 * @param {function} callback Função a executar quando o servidor devolve a respostas
 */
function getRoom(roomName, callback) {
  if (callback instanceof Function) {
    var url = "/room/" + roomName;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        var response = JSON.parse(this.responseText);
        if (this.status === 200) {
          if (response.room) {
            selectedRoom = response.room;
            callback();
          }
        } else {
          alert(response.message);
        }
      }
    };
    xhr.send();
  } else {
    throw new Error("callback is not a function");
  }
}

/**
 * Função para onter os membros de uma sala através do seu ID
 * @param {int} roomId ID da sala
 */
function getRoomMembers(roomId) {
  var url = "/room/" + roomId + "/members";
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var response = JSON.parse(this.responseText);
        if (response.members) {
          roomMembers = response.members;
        }
      }
    }
  };
  xhr.send();
}

/**
 * Função para preechimento da lista de salas de chat disponíveis
 */
function loadAvailableRooms() {
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  var chatRooms = document.getElementById("chat-rooms");
  var listOptions = "";

  getRooms();

  rooms.forEach((room) => {
    getRoomMembers(room.id);

    if (
      roomMembers.every((member) => member.username != currentUser.username)
    ) {
      listOptions += '<option value="' + room.name + '" />';
    }
  });
  chatRooms.innerHTML = "";
  chatRooms.innerHTML = listOptions;
}

/**
 * Função para construir a lista de salas
 */
function buildRoomsList() {
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  var userRooms = [];

  var url = "/user/" + currentUser.id + "/rooms";
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var response = JSON.parse(this.responseText);
        if (response.userRooms) {
          userRooms = response.userRooms;

          var list = document.getElementById("list-userRooms");
          list.innerHTML = "";
          userRooms.forEach((userRoom) => {
            let card = document.createElement("div");
            let roomName = document.createElement("span");
            let enterButton = document.createElement("a");
            let br = document.createElement("br");

            card.className = "card text-center p-3";
            roomName.innerHTML = userRoom.name + " ";

            enterButton.setAttribute(
              "href",
              "javascript: joinRoom('" + userRoom.name + "')"
            );
            enterButton.className = "btn btn-secondary";
            enterButton.setAttribute("role", "button");

            enterButton.innerHTML = "Entrar";

            roomName.appendChild(enterButton);
            card.appendChild(roomName);

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
 * Função para entrar numa sala
 */
function enterRoom() {
  var currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  var roomName = document.getElementById("chat-rooms-list").value;
  var password;

  getRoom(roomName, function () {
    if (selectedRoom) {
      if (selectedRoom[0].private == 1) {
        password = prompt("Introduza a password da sala");
      }

      var xhr = new XMLHttpRequest();
      xhr.open("POST", "/enter-room");
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          var response = JSON.parse(this.responseText);
          if (this.status === 200) {
            if (response.member) {
              joinRoom(roomName);
            }
          }
          alert(response.message);
        }
      };

      var data = {
        userId: currentUser.id,
        roomName: roomName,
        password: password,
      };
      xhr.send(JSON.stringify(data));
    }
  });
}

/**
 * Função para dar join numa sala
 * @param {string} roomName Nome da sala
 */
function joinRoom(roomName) {
  getRoom(roomName, function () {
    if (selectedRoom) {
      sessionStorage.setItem("currentRoom", JSON.stringify(selectedRoom));
      window.open("./chat.html", "_self");
    } else {
      console.log("The room is missing");
    }
  });
}
