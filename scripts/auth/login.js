// 로그인 메인 로직

// 로그인 폼 검증
const formValidation = {
  email: false,
  password: false
};

// 이메일 입력 이벤트
function setupEmailEvents() {
  console.log('로그인 : 이메일 처리 중');
  const emailInput = document.getElementById('emailInput');
  
  emailInput.addEventListener('blur', function() {
    validateEmail(this.value.trim(), formValidation, true);
    updateButtonState(formValidation);
  });
  
  emailInput.addEventListener('input', function() {
    if (this.value) clearError('emailInput');
  });
}

// 비밀번호 입력 이벤트
function setupPasswordEvents() {
  console.log('로그인 : 비밀번호 처리 중');
  const passwordInput = document.getElementById('passwordInput');
  
  passwordInput.addEventListener('blur', function() {
    validatePassword(this.value, formValidation, true);
    updateButtonState(formValidation);
  });
  
  passwordInput.addEventListener('input', function() {
    if (this.value) clearError('passwordInput');
  });
}

// '로그인' 버튼 이벤트
function setupLoginBtnEvents() {
  console.log('로그인 시도');
  
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 데이터 수집
    const formData = {
      email: document.getElementById('emailInput').value.trim(),
      password: document.getElementById('passwordInput').value
    };
    
    // 최종 검증
    const isValid = 
      validateEmail(formData.email, formValidation, true) &&
      validatePassword(formData.password, formValidation, true);

    if (!isValid) {
      console.log('검증 실패');
      return;
    }
    
    // TODO : api 연결 시도

    navigateTo('main.html', 1000);
  });
}

// 로그인 페이지 초기화
function init() {
  console.log('로그인 페이지 불러오는 중');
  
  setupEmailEvents();
  setupPasswordEvents();
  setupLoginBtnEvents();
  
  updateButtonState(formValidation);
  
  console.log('로그인 페이지 로딩 완료!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('login.js 로드 완료');