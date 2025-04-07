function signup() {
    const username = document.getElementById("newUsername").value;
    const password = document.getElementById("newPassword").value;
    const email = document.getElementById("email").value;
    const nickname = document.getElementById("nickname").value;
    const birth = document.getElementById("birth").value;
    const phone = document.getElementById("phone").value;
    const gender = document.getElementById("gender").value;
  
    if (!username || !password || !email || !nickname || !birth || !phone || !gender) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
  
    if (localStorage.getItem("user_" + username)) {
      alert("이미 존재하는 아이디입니다.");
      return;
    }
  
    const userData = {
      username,
      password,
      email,
      nickname,
      birth,
      phone,
      gender
    };
  
    localStorage.setItem("user_" + username, JSON.stringify(userData));
    alert("회원가입이 완료되었습니다. 로그인 해주세요!");
    window.location.href = "./login.html";
  }