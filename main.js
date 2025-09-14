// main.js

let currentUser = null;

function goToLogin() {
  document.getElementById("welcomeContainer").classList.add("hidden");
  document.getElementById("posContainer").classList.remove("hidden");
}

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (users[username] && users[username].password === password) {
    currentUser = username;
    document.getElementById("posContainer").classList.add("hidden");

    if (users[username].role === "admin") {
      document.getElementById("adminContainer").classList.remove("hidden");
      loadAllProfiles();
    } else {
      document.getElementById("residentContainer").classList.remove("hidden");
      loadResidentProfile();
    }
  } else {
    document.getElementById("loginError").innerText = "Invalid username or password!";
  }
}

// ... (rest of your functions go here)
