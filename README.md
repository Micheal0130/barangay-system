<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Barangay Login & Profile</title>
   <link rel="stylesheet" href="higop.css">
   <script src="data.js"></script>

  <style>
    .hidden { display: none; }
    .container {
      max-width: 760px;
      margin: 30px auto;
      padding: 20px;
      border-radius: 10px;
      background: rgb(0, 61, 23);
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      text-align: center;
    }
    h1, h2 { color: #00ff00; }
    button {
      padding: 10px 20px;
      margin: 10px;
      border: none;
      border-radius: 5px;
      background: #3498db;
      color: white;
      cursor: pointer;
    }
    button:hover { background: #2980b9; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
      background: #fff;
    }
    th {
      background: #27ae60;
      color: white;
    }
  </style>
</head>
<body>

<!-- Welcome Section -->
<div class="container" id="welcomeContainer">
  <h1>Welcome to Barangay System</h1>
  <p>Please click below to proceed.</p>
  <button onclick="goToLogin()">Proceed to Login</button>
</div>

<!-- Login Section -->
<div class="container hidden" id="posContainer">
  <h2>Barangay Login</h2>
  <label>Username:</label>
  <input type="text" id="username">
  <label>Password:</label>
  <input type="password" id="password">
  <div style="text-align: center;">
    <button onclick="login()">Login</button>
  </div>
  <p id="loginError" style="color: red;"></p>
</div>

<!-- Resident Profile Section -->
<div class="container hidden" id="residentContainer">
  <h2>My Profile</h2>
  <label>Name:</label>
  <input type="text" id="resName">
  <label>Age:</label>
  <input type="number" id="resAge">
  <label>Address:</label>
  <input type="text" id="resAddress">
  <button onclick="updateResident()">Update Profile</button>
  <button onclick="logout()">🔙 Return</button>
  <p id="resMessage" style="color: green;"></p>
</div>

<!-- Admin Section -->
<div class="container hidden" id="adminContainer">
  <h2>Barangay Residents Database</h2>
  <button onclick="showAddForm()">➕ Add New Resident</button>
  <button onclick="logout()">🔙 Return</button>

  <!-- Search Section -->
  <div style="margin: 20px 0;">
    <select id="searchCategory">
      <option value="id">ID</option>
      <option value="name">Name</option>
      <option value="age">Age</option>
      <option value="address">Address</option>
    </select>
    <input type="text" id="searchInput" placeholder="Enter search keyword">
    <button onclick="searchResidents()">🔍 Search</button>
    <button onclick="loadAllProfiles()">🔄 Reset</button>
  </div>

  <!-- Add Form -->
  <div id="addForm" class="hidden">
    <h3>Add Resident</h3>
    <label>Id:</label>
    <input type="text" id="newUsername">
    <label>Password:</label>
    <input type="password" id="newPassword">
    <label>Name:</label>
    <input type="text" id="newName">
    <label>Age:</label>
    <input type="number" id="newAge">
    <label>Address:</label>
    <input type="text" id="newAddress">
    <button onclick="addResident()">Add</button>
  </div>

  <!-- Table -->
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Name</th>
        <th>Age</th>
        <th>Address</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="allProfiles"></tbody>
  </table>
</div>

<script>
  const users = {
    admin: { password: "1234", role: "admin" },
  };

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

  function loadResidentProfile() {
    const user = users[currentUser];
    document.getElementById("resName").value = user.name;
    document.getElementById("resAge").value = user.age;
    document.getElementById("resAddress").value = user.address;
  }

  function updateResident() {
    users[currentUser].name = document.getElementById("resName").value;
    users[currentUser].age = document.getElementById("resAge").value;
    users[currentUser].address = document.getElementById("resAddress").value;
    document.getElementById("resMessage").innerText = "Profile updated successfully!";
  }

  function showAddForm() {
    document.getElementById("addForm").classList.toggle("hidden");
  }

  function logout() {
    currentUser = null;
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    document.getElementById("loginError").innerText = "";
    document.getElementById("residentContainer").classList.add("hidden");
    document.getElementById("adminContainer").classList.add("hidden");
    document.getElementById("posContainer").classList.add("hidden");
    document.getElementById("welcomeContainer").classList.remove("hidden");
  }

  function addResident() {
    const username = document.getElementById("newUsername").value.trim();
    const password = document.getElementById("newPassword").value.trim();
    const name = document.getElementById("newName").value.trim();
    const age = document.getElementById("newAge").value.trim();
    const address = document.getElementById("newAddress").value.trim();

    if (!username || !password || !name || !age || !address) {
      alert("Please fill all fields");
      return;
    }
    if (users[username]) {
      alert("Username already exists!");
      return;
    }

    users[username] = { password, role: "resident", name, age, address };
    loadAllProfiles();

    document.getElementById("addForm").classList.add("hidden");
    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
    document.getElementById("newName").value = "";
    document.getElementById("newAge").value = "";
    document.getElementById("newAddress").value = "";
  }

  function deleteResident(username) {
    if (confirm(`Are you sure you want to delete ${username}?`)) {
      delete users[username];
      loadAllProfiles();
    }
  }

  function updateResidentAdmin(username) {
    const name = document.getElementById(`name-${username}`).value;
    const age = document.getElementById(`age-${username}`).value;
    const address = document.getElementById(`address-${username}`).value;
    users[username].name = name;
    users[username].age = age;
    users[username].address = address;
    alert("Profile updated successfully!");
  }

  function loadAllProfiles() {
    const tableBody = document.getElementById("allProfiles");
    tableBody.innerHTML = "";
    for (const username in users) {
      if (users[username].role === "resident") {
        const u = users[username];
        tableBody.innerHTML += `
          <tr>
            <td>${username}</td>
            <td><input type="text" id="name-${username}" value="${u.name}"></td>
            <td><input type="number" id="age-${username}" value="${u.age}"></td>
            <td><input type="text" id="address-${username}" value="${u.address}"></td>
            <td>
              <button onclick="updateResidentAdmin('${username}')">Update</button>
              <button style="background:#e74c3c" onclick="deleteResident('${username}')">Delete</button>
            </td>
          </tr>
        `;
      }
    }
  }

  function searchResidents() {
    const category = document.getElementById("searchCategory").value;
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    const tableBody = document.getElementById("allProfiles");
    tableBody.innerHTML = "";

    let found = false;

    for (const username in users) {
      const user = users[username];
      if (user.role !== "resident") continue;

      let valueToCheck = "";

      if (category === "id") valueToCheck = username.toLowerCase();
      if (category === "name") valueToCheck = user.name.toLowerCase();
      if (category === "age") valueToCheck = String(user.age);
      if (category === "address") valueToCheck = user.address.toLowerCase();

      if (valueToCheck.includes(query)) {
        found = true;
        tableBody.innerHTML += `
          <tr>
            <td>${username}</td>
            <td><input type="text" id="name-${username}" value="${user.name}"></td>
            <td><input type="number" id="age-${username}" value="${user.age}"></td>
            <td><input type="text" id="address-${username}" value="${user.address}"></td>
            <td>
              <button onclick="updateResidentAdmin('${username}')">Update</button>
              <button style="background:#e74c3c" onclick="deleteResident('${username}')">Delete</button>
            </td>
          </tr>
        `;
      }
    }

    if (!found) {
      tableBody.innerHTML = `<tr><td colspan="5">No results found.</td></tr>`;
    }
  }
</script>

</body>
</html>
