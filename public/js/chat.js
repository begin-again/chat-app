/* global io:readonly alert Mustache moment Qs location getComputedStyle */
const socket = io();

// elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;

  // height of new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = $messages.offsetHeight;

  // height of messages container
  const contentHeight = $messages.scrollHeight;

  // how far down scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (contentHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    username: message.username,
    createdAt: moment(message.createdAt).format('hh:mm:ss A')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('hh:mm:ss A')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll();
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  });
  $sidebar.innerHTML = html;
});

function sendMessage (message, cb) {
  socket.emit('sendMessage', message, (error, info) => {
    if (error) return cb(error);
    return cb();
  });
}

function sendLocation (coords, cb) {
  const { latitude, longitude } = coords;
  socket.emit('sendLocation', { latitude, longitude }, (err, info) => {
    if (err) return cb(err);
    return cb();
  });
}

// handlers
function handleLocationButtonClick (event) {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }
  $locationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition((position) => {
    sendLocation(position.coords, () => {
      $locationButton.removeAttribute('disabled');
    });
  });
}

function handleMessageFormButtonClick (event) {
  event.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');

  const message = event.target.elements.message;
  sendMessage(message.value, () => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
  });
}

$messageForm.addEventListener('submit', handleMessageFormButtonClick);
$locationButton.addEventListener('click', handleLocationButtonClick);
