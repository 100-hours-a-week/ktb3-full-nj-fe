/**
 * 비밀번호 수정
 */ 

// 폼 검증 상태
const validation = {
  password: false,
  passwordConfirm: false
};

// 비밀번호 입력 이벤트
function setupPasswordEvents() {
  console.log('비밀번호 수정 : 비밀번호 입력 처리 중');
  const passwordInput = document.getElementById('passwordInput');
  
  passwordInput.addEventListener('blur', function() {
    validatePassword(this.value, validation);
    updateButtonState(validation);
  });
  
  passwordInput.addEventListener('input', function() {
    if (this.value) clearError('passwordInput');
    updateButtonState(validation);
  });
}

// 비밀번호 확인 입력 이벤트
function setupPasswordConfirmEvents() {
  console.log('비밀번호 수정 : 비밀번호 확인 입력 처리 중');
  const passwordConfirmInput = document.getElementById('passwordConfirmInput');
  
  passwordConfirmInput.addEventListener('blur', function() {
    validatePasswordConfirm(this.value, validation);
    updateButtonState(validation);
  });
  
  passwordConfirmInput.addEventListener('input', function() {
    if (this.value) clearError('passwordConfirmInput');
    updateButtonState(validation);
  });
}

// '수정하기' 버튼 이벤트
function setupSubmitEvent() {
  console.log('비밀번호 수정 : 수정하기 버튼 처리 중');

  document.getElementById('passwordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const password = document.getElementById('passwordInput').value;
    const passwordConfirm = document.getElementById('passwordConfirmInput').value;
    
    // 검증
    if (!validatePassword(password, validation)) {
      console.log('검증 실패: 비밀번호');
      return;
    }
    if (!validatePasswordConfirm(passwordConfirm, validation)) {
      console.log('검증 실패: 비밀번호 확인');
      return;
    }
    
    // 로딩 상태
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '수정 중...';
    
    // Phase 1: Mock 처리
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '수정하기';
      
      // 성공 토스트
      showToast('수정 완료');
      
      // 2초 후 메인 페이지로
      setTimeout(() => {
        navigateTo('main.html');
      }, 2000);
      
      // Phase 2: 실제 API 호출
      // const result = await fetch('/api/user/password', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ password })
      // });
    }, 1000);
  });
}

// 페이지 초기화
function init() {
  console.log('비밀번호 수정 페이지 불러오는 중');
  
  setupPasswordEvents();
  setupPasswordConfirmEvents();
  setupSubmitEvent();
  
  console.log('비밀번호 수정 페이지 로딩 완료!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('users/password_edit.js 로드 완료');