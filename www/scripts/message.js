/**
 * Função para criar o elemento de uma mensagem
 * @param {json} message - Mensagem a construir
 * @param {json} user - Utilizador loggado
 * @returns Elemento da mensagem
 */
function createMessageElement(message, user) {
  var messageType = "message";
  var hasImage = "none";
  var date = new Date(message.date);

  var timestamp = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;

  var href;

  var author = message.author;

  if (message.target != null) author = `&#128274; ${message.author}`;

  if (message.author == user.username) messageType = "user-message";
  else href = `href="javascript: sendPrivateMessage('${message.author}')"`;

  if (message.image) hasImage = "block";

  var content = convertEmojis(message.content);

  var messageElement = `
    <div class="card ${messageType}" style="width: 18rem">
    <div class="card-body">
      <a
        class="card-title text-danger h5 text-decoration-none" ${href} style="color: ${message.author_color}!important"
      >${author}</a>
    <img
      src="${message.image}"
      class="card-img-top"
      alt="image"
      style="display: ${hasImage}"
    />
    <p class="card-text p-1">${content}</p>
    <p class="card-text time">${timestamp}</p>
  </div>
</div>
<br />`;

  return messageElement;
}

/**
 * Função para converter emojis e texto presentes na mensagem para o seu correpondente gráfico
 * @param {string} messageContent - Conteúdo da mensagem
 * @returns Mensagem com emojis convertidos
 */
function convertEmojis(messageContent) {
  let word = messageContent.split(" ");
  let result = "";
  for (let i = 0; i < word.length; i++) {
    if (word[i].includes(":)")) word[i] = "&#128578;"; //smile
    else if (word[i].includes(":(")) word[i] = "&#128542;"; //triste
    else if (word[i].includes("<3")) word[i] = "&#128153;"; //coração

    result += word[i] + " ";
  }
  return result;
}

/**
 * Função para apresentar notificação de uma mensagem
 * @param {json} message Mensagem a notificar
 */
function messageNotification(message) {
  if (!window.Notification) {
    //loga erro caso o browser não suporte notificações
    console.error("Browser does not support notifications");
  } else {
    //caso as notificações sejam permitidas, estas são despoletadas
    if (Notification.permission === "granted") {
      new Notification("ChatDat: " + message.author, {
        body: message.content,
      });
    } else {
      //caso contrário pedir autorização para enviar notificações
      Notification.requestPermission()
        .then(function (perm) {
          if (perm === "granted") {
            new Notification("ChatDat: " + message.author, {
              body: message.content,
            });
          } else {
            console.log("User blocked notifications!");
          }
        })
        .catch(function (e) {
          console.error(e);
        });
    }
  }
}
