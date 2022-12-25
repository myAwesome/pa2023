export const TOKEN_KEY = 'token';

const messageNode = document.querySelector('#message');

export const setItemToStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    console.log(err);
    messageNode.innerHTML = 'Please, enable cookies to use our site';
    messageNode.className = 'root-message';
  }
};

export const getItemFromStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (err) {
    console.log(err);
    messageNode.innerHTML = 'Please, enable cookies to use our site';
    messageNode.className = 'root-message';
    return null;
  }
};

export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (err) {
    console.log(err);
    messageNode.innerHTML = 'Please, enable cookies to use our site';
    messageNode.className = 'root-message';
  }
};
