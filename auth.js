/* =========================================================
   auth.js — Autenticação e sessão
   ========================================================= */

let isLoggedIn  = false;
let currentUser = null;

function doLogin() {
  const u    = document.getElementById('login-user').value.trim();
  const p    = document.getElementById('login-pass').value;
  const user = DB.users.find(x => x.username === u && x.password === p);

  if (user) {
    isLoggedIn  = true;
    currentUser = user;
    document.getElementById('login-error').style.display = 'none';
    closeModal('modal-login');
    showSection('admin');
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

function adminLogout() {
  isLoggedIn  = false;
  currentUser = null;
  showSection('home');
}
