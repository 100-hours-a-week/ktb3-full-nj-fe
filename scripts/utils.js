// 유틸 변수 및 함수

// 회원가입 필드별 검증 상태 확인 => 전역 변수
const formValidation = {
  profileImage: false,
  email: false,
  password: false,
  passwordConfirm: false,
  nickname: false
};

// 에러 메세지 출력
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const helperText = input.nextElementSibling;
  
  input.style.borderColor = '#ff4444';
  helperText.textContent = message;
  helperText.style.display = 'block';
}

// 에러 메세지 삭제
function clearError(inputId) {
  const input = document.getElementById(inputId);
  const helperText = input.nextElementSibling;
  
  input.style.borderColor = '#e0e0e0';
  helperText.style.display = 'none';
}

// 회원가입 버튼 상태
function updateButtonState() {
  const submitBtn = document.querySelector('button[type="submit"]');
  const allValid = Object.values(formValidation).every(v => v === true);
  
  if (allValid) {
    submitBtn.disabled = false;
    submitBtn.style.background = '#7F6AEE';
    submitBtn.style.cursor = 'pointer';
  } else {
    submitBtn.disabled = true;
    submitBtn.style.background = '#ACA0EB';
    submitBtn.style.cursor = 'not-allowed';
  }
}

// 로딩
function setLoadingState(isLoading) {
  const submitBtn = document.querySelector('button[type="submit"]');
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.textContent = '처리중...';
    submitBtn.style.cursor = 'wait';
  } else {
    submitBtn.textContent = '회원가입';
    updateButtonState();
  }
}