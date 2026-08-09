// Credenciales del panel — cámbialas aquí antes de publicar si quieres.
const CREDENTIALS = {
  email: "fincapalosverdessuelovivo@gmail.com",
  password: "domitilapv",
};

const SESSION_KEY = "pv_session_ok";

function isLoggedIn() {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

function login(email, password) {
  const ok =
    email.trim().toLowerCase() === CREDENTIALS.email.toLowerCase() &&
    password === CREDENTIALS.password;
  if (ok) sessionStorage.setItem(SESSION_KEY, "1");
  return ok;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

// Guard para app.html
function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "index.html";
  }
}
