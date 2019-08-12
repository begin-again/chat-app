const generateMessage = (text, username = 'Admin') => {
  return {
    text,
    username,
    createdAt: new Date().getTime()
  };
};
const generateLocationMessage = (url, username = 'Admin') => {
  return {
    username,
    url,
    createdAt: new Date().getTime()
  };
};

module.exports = {
  generateMessage,
  generateLocationMessage
};
