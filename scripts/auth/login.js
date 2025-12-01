// ==================== Import ====================

import { login } from '../common/api/auth.js';

import { 
  showError, 
  clearError, 
  updateButtonState, 
  showToast, 
  navigateTo,
  hideLoading
} from '../common/util/utils.js';

import { 
  validateEmail, 
  validatePassword 
} from '../common/util/validators.js';
 
// ==================== 상태 관리 ====================

const formValidation = {
  email: false,
  password: false
};

// ==================== 이벤트 핸들러 ====================

function setupEmailEvents() {
  const emailInput = document.getElementById('emailInput');
  
  emailInput.addEventListener('blur', () => {
    validateEmail(emailInput.value.trim(), formValidation);
    updateButtonState(formValidation);
  });
  
  emailInput.addEventListener('input', () => {
    if (emailInput.value) clearError('emailInput');
    updateButtonState(formValidation);
  });
}

function setupPasswordEvents() {
  const passwordInput = document.getElementById('passwordInput');
  
  passwordInput.addEventListener('blur', () => {
    validatePassword(passwordInput.value.trim(), formValidation);
    updateButtonState(formValidation);
  });
  
  passwordInput.addEventListener('input', () => {
    if (passwordInput.value) clearError('passwordInput');
    updateButtonState(formValidation);
  });
}

function setupFormSubmit() {
  const loginForm = document.getElementById('loginForm');
  
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    
    // 검증
    const emailValid = validateEmail(email, formValidation);
    const passwordValid = validatePassword(password, formValidation);
    
    if (!emailValid || !passwordValid) {
      return;
    }
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '로그인 중...';
    
    try {
      const response = await login(email, password);
      
      console.log('로그인 성공!', response);
      showToast('로그인 성공!');
      
      navigateTo('main.html', 1000);
      
    } catch (error) {
      console.error('로그인 실패:', error);
      
      if (error.status === 401) {
        showError('emailInput', '이메일 또는 비밀번호가 일치하지 않습니다');
      } else {
        showToast(error.message || '로그인 중 오류가 발생했습니다', 2000, 'error');
      }
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// ==================== 초기화 ====================

function init() {  
  hideLoading();
  
  setupEmailEvents();
  setupPasswordEvents();
  setupFormSubmit();
  
  updateButtonState(formValidation, false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('login.js 로드 완료');