// 로그인 메인 로직

// 로그인 폼 검증
const formValidation = {
  email: false,
  password: false
};

// 이메일 입력 이벤트
function setupEmailEvents() {
  console.log('로그인 : 이메일 처리 중');
  
  document.getElementById('emailInput').addEventListener('blur', function() {
    validateEmail(this.value.trim(), formValidation, false);
    updateButtonState(formValidation);
  });
  
  document.getElementById('emailInput').addEventListener('input', function() {
    if (this.value) clearError('emailInput');
  });
}

// 비밀번호 입력 이벤트
function setupPasswordEvents() {
  console.log('로그인 : 비밀번호 처리 중');
  
  document.getElementById('passwordInput').addEventListener('blur', function() {
    validatePassword(this.value, formValidation, false);
    updateButtonState(formValidation);
  });
  
  document.getElementById('passwordInput').addEventListener('input', function() {
    if (this.value) clearError('passwordInput');
  });

  // Enter 키로 로그인
  // document.getElementById('passwordInput').addEventListener('keypress', function(e) { 
  //   if (e.key === 'Enter') {
  //     e.preventDefault();
  //     document.getElementById('loginForm').dispatchEvent(new Event('submit'));
  //   }
  // });
}

// 로그인 폼 제출 입력 이벤트
function setupFormSubmitEvent() {
  console.log('로그인 : 폼 처리 중');
  
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    handleSubmit();
  });
}

// 로그인 진행
function handleSubmit() {
  console.log('로그인 시도');
  
  // 데이터 수집
  const formData = {
    email: document.getElementById('emailInput').value.trim(),
    password: document.getElementById('passwordInput').value
  };
  
  // 최종 검증
  const validations = {
    email: validateEmail(formData.email, formValidation, false),
    password: validatePassword(formData.password, formValidation, false)
  };
  
  const allValid = Object.values(validations).every(v => v === true);
  if (!allValid) {
    console.log('검증 실패');
    return;
  }
  
  console.log('로그인 : 모든 검증 통과');

  console.log('로그인 성공 시 → main.html로 이동');

  alert('검증 완료!');

  // TODO : api 연결 시도
}

// 로그인 페이지 초기환
function init() {
  console.log('로그인 페이지 불러오는 중');
  
  setupEmailEvents();
  setupPasswordEvents();
  setupFormSubmitEvent();
  
  updateButtonState(formValidation);
  
  console.log('로그인 페이지 로딩 완료!');
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('login.js 로드 완료');