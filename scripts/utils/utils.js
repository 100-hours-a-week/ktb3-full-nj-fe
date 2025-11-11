// 유틸 변수 및 함수

// 에러 메세지 출력
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const helperText = input.nextElementSibling;
  
  input.style.borderColor = '#ff4444';
  helperText.textContent = message;
  helperText.style.display = 'block';
}

// 에러 메세지 초기화
function clearError(inputId) {
  const input = document.getElementById(inputId);
  const helperText = input.nextElementSibling;
  
  input.style.borderColor = '#e0e0e0';
  helperText.style.display = 'none';
}

// 회원가입 버튼 상태
function updateButtonState(formValidation) {
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

// 로딩 표시
function setLoadingState(isLoading, loadingText = '처리중...', defaultText = null) {
  const submitBtn = document.querySelector('button[type="submit"]');
  if (!submitBtn) return;
  
  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.textContent = loadingText;
    submitBtn.style.cursor = 'wait';
  } else {
    // 기본 텍스트 자동 감지
    if (!defaultText) {
      const form = submitBtn.closest('form');
      if (form && form.id.includes('login')) {
        defaultText = '로그인';
      } else if (form && form.id.includes('signin')) {
        defaultText = '회원가입';
      } else {
        defaultText = '완료';
      }
    }
    submitBtn.textContent = defaultText;
    submitBtn.disabled = false;
  }
}