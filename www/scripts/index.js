"use strict";

/**
 * Função que será executada quando a página inicial estiver toda carregada, criando as variáveis globais:
 * pickerVisible - para controlar a visibilidade do color picker
 * isUserLooged - para controlar se o utilizador está loggado
 * selectedColor - para controlar a cor selecionada na criação de contas
 *
 * @memberof window
 */
window.onload = function () {
  var pickerVisible = false;
  var isUserLogged = false;
  var selectedColor;

  window.isUserLogged = isUserLogged;
  window.pickerVisible = pickerVisible;
  window.selectedColor = selectedColor;

  loggedUser();
  loadAvailableRooms();
};

/**
 * Função para mostrar uma das páginas
 * @param {string} pageID - atributo id da página
 * @param {string} pageTitle - título a apresentar na página
 */
function showPage(pageID, pageTitle) {
  let page = document.getElementById(pageID);
  let allPages = document.getElementsByClassName("page");
  document.getElementById("page-title").innerHTML = pageTitle;
  document.getElementById("page-title").style.color = "black";

  let primaryLink = document.getElementById("primaryLink");
  let secondaryLink = document.getElementById("secondaryLink");

  for (var i = 0; i < allPages.length; i++) allPages[i].style.display = "none";

  page.style.display = "block";

  if (isUserLogged) {
    primaryLink.innerHTML = "Sair";
    primaryLink.setAttribute("href", "javascript: logoutUser()");

    secondaryLink.innerHTML = "Inicio";
    secondaryLink.style.display = "block";
    secondaryLink.setAttribute("href", "javascript: loggedUser()");
  } else {
    primaryLink.innerHTML = "Entrar";
    primaryLink.setAttribute("href", "javascript: showPage('login', 'Entrar')");

    secondaryLink.innerHTML = "Registar";
    secondaryLink.style.display = "block";
    secondaryLink.setAttribute(
      "href",
      "javascript: showPage('signup', 'Registar')"
    );
  }
}

/**
 * Função para escolher uma cor predefinida
 * @param {string} elemento - cor escolhida
 */
function setColor(elemento) {
  if (arguments.length == 1) {
    selectedColor = elemento.style.backgroundColor;
  } else {
    throw new Error("Color not specified");
  }
}

/**
 * Função para mostrar/esconder o color picker
 */
function showPicker() {
  if (pickerVisible) {
    document.getElementById("color-picker").style.display = "none";
    document.getElementById("more-colors").innerHTML = "Ver picker &darr;";
  } else {
    document.getElementById("color-picker").style.display = "block";
    document.getElementById("more-colors").innerHTML = "Esconder picker &uarr;";
  }
  pickerVisible = !pickerVisible;
}

/**
 * Função para apresentar o perfil de um utilizador
 * @param {json} user
 */
function showUserProfile(user) {
  showPage("userprofile", "Bem-vindo " + user.username + "!");
  document.getElementById("page-title").style.color = user.color;
  sessionStorage.removeItem("currentRoom");
}

/**
 * Função para mostrar/esconder o input de password de sala privada (na sua criação)
 */
function showRoomPassword() {
  if (document.getElementById("private-room").checked) {
    document.getElementById("private-room-password").style.display = "block";
  } else
    document.getElementById("private-room-password").style.display = "none";
}
