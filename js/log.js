var btnLogin = document.getElementById('do-login');
var idLogin = document.getElementById('login');
var usernameInput = document.getElementById('username');
var passwordInput = document.querySelector('.password');

btnLogin.onclick = function () {
  var enteredUsername = usernameInput.value;
  var enteredPassword = passwordInput.value;


  fetch('json/users.json')
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var users = data.users;

      for (var i = 0; i < users.length; i++) {
        if (users[i].username === enteredUsername && users[i].password === enteredPassword) {
          idLogin.innerHTML = '<p>We\'re happy to see you again, </p><h1>' + enteredUsername + '</h1>';
          setTimeout(function () {
            window.location.href = 'index.html';
          }, 2500); 
          return;
        }
      }

      idLogin.innerHTML = '<p>Invalid username or password. Please try again.</p>';

      setTimeout(function () {
        idLogin.innerHTML = '';
      }, 2500);
       setTimeout(function () {
        window.location.href = 'login.html';
     }, 2500);
    })
    .catch(function (error) {
      console.error('Error fetching user data: ' + error);
    });
};
