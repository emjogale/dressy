const login = async (username, password) => {
  console.log(username, password);
  alert(`Hi, ${username}`);
};

document.querySelector(".login").addEventListener("submit", e => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  login(username, password);
});
