"use strict";

/**
 * Função para executar o login de um utilizador
 */
function loginUser() {
  var username = document.getElementById("login-username").value;
  var password = document.getElementById("login-password").value;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/login");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      var response = JSON.parse(this.responseText);
      if (this.status === 200) {
        window.isUserLogged = true;
        showUserProfile(response.user);
        sessionStorage.setItem("currentUser", JSON.stringify(response.user));
      }

      alert(response.message);
    }
  };
  xhr.send(JSON.stringify({ username, password }));
}

/**
 * Função para executar o registo de um utilizador
 */
function registerUser() {
  var username = document.getElementById("signup-username").value;
  var password = document.getElementById("signup-password").value;
  var color = selectedColor;

  if (username) {
    if (password.length >= 8) {
      if (color) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "json";
        xhr.open("POST", "/signup");
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
          if (this.readyState === 4) {
            if (this.status === 200) {
              alert("Conta criada com sucesso");
              showPage("login", "Entrar");
            } else if (this.status === 409) {
              alert("O nome de utilizador já existe!");
            } else {
              alert(`Ocorreu um erro inesperado: ${this.response.messsage}`);
            }
          }
        };
        xhr.send(JSON.stringify({ username, password, color }));
      } else {
        alert("Selecione uma cor para o utilizador!");
        throw new Error("Color not selected");
      }
    } else {
      alert("Password muito curta! Tem que ter pelo menos 8 caracteres");
      throw new Error("Password too short");
    }
  } else {
    alert("Preencha o nome de utilizador!");
    throw new Error("Username not filled");
  }
}

function loggedUser() {
  var xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.open("GET", "/verify-login");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      if (this.status === 200 && this.response.user) {
        window.isUserLogged = true;
        showUserProfile(this.response.user);
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify(this.response.user)
        );
      } else {
        showPage("login", "Entrar");
      }
    }
  };
  xhr.send();
}

function logoutUser() {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "/logout");
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.onreadystatechange = function () {
    if (this.readyState === 4) {
      var response = JSON.parse(this.responseText);
      if (this.status === 200) {
        window.isUserLogged = false;
        sessionStorage.clear();
        showPage("login", "Entrar");
      } else {
        alert(`Ocorreu um erro inesperado: ${response.messsage}`);
      }
    }
  };
  xhr.send();
}
