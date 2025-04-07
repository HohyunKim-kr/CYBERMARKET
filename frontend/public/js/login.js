function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const savedUser = JSON.parse(localStorage.getItem("user_" + username));
  
    if (!savedUser || savedUser.password !== password) {
      alert("아이디 또는 비밀번호가 잘못되었습니다.");
      return;
    }
  
    alert(`${savedUser.nickname}님, 환영합니다!`);
    localStorage.setItem("currentUser", username);
    window.location.href = "./index.html";
  }