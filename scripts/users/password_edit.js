// ==================== Import ====================

import { updatePassword } from '../common/api/user.js';

import { 
  showError, 
  clearError, 
  updateButtonState, 
  showToast, 
  navigateTo,
  confirmBack
} from '../common/util/utils.js';

import { 
  validatePassword,
  validatePasswordConfirm
} from '../common/validators.js';

import { initHeader } from '../common/component/header.js';

// ==================== 상태 관리 ====================

const formValidation = {
  password: false,
  passwordConfirm: false
};

// ==================== 이벤트 핸들러 ====================

function setupPasswordEvents() {  
  const passwordInput = document.getElementById('passwordInput');
  
  passwordInput.addEventListener('blur', () => {
    validatePassword(passwordInput.value, formValidation);
    updateButtonState(formValidation);
  });
  
  passwordInput.addEventListener('input', () => {
    if (passwordInput.value) clearError('passwordInput');
    updateButtonState(formValidation);
  });
}

// 비밀번호 확인 입력 이벤트
function setupPasswordConfirmEvents() {
  const passwordConfirmInput = document.getElementById('passwordConfirmInput');
  
  passwordConfirmInput.addEventListener('blur', () => {
    validatePasswordConfirm(passwordConfirmInput.value, formValidation);
    updateButtonState(formValidation);
  });
  
  passwordConfirmInput.addEventListener('input', () => {
    if (passwordConfirmInput.value) clearError('passwordConfirmInput');
    updateButtonState(formValidation);
  });
}

// '수정하기' 버튼 이벤트
function setupSubmitEvent() {
  const passwordForm = document.getElementById('passwordForm');
  
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('passwordInput').value;
    const passwordConfirm = document.getElementById('passwordConfirmInput').value;
    
    if (!validatePassword(password, formValidation)) {
      console.log('검증 실패: 비밀번호');
      return;
    }
    if (!validatePasswordConfirm(passwordConfirm, formValidation)) {
      console.log('검증 실패: 비밀번호 확인');
      return;
    }
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '수정 중...';
    
    try {
      const response = await updatePassword(password);

      console.log('비밀번호 변경 완료!', response);
      showToast(response.message || '비밀번호가 변경되었습니다');
      
      document.getElementById('passwordInput').value = '';
      document.getElementById('passwordConfirmInput').value = '';
      formValidation.password = false;
      formValidation.passwordConfirm = false;
      
      navigateTo('main.html', 2000);
      
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      
      if (error.status === 400) {
        showError('passwordForm', error.message || '비밀번호 형식을 확인해주세요');
      } else if (error.status === 401) {
        showToast('로그인이 필요합니다');
        setTimeout(() => navigateTo('login.html'), 1500);
      } else if (error.status === 403) {
        showError('passwordForm', '현재 비밀번호가 일치하지 않습니다');
      } else {
        showToast('비밀번호 변경 중 오류가 발생했습니다', 2000, 'error');
      }
      
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// 뒤로가기 버튼 설정
function setupBackButton() {
  const backBtn = document.querySelector('.header-back');
  if (backBtn) {
    backBtn.onclick = () => {
      const passwordChanged = 
        document.getElementById('passwordInput').value.trim() !== "";

      const passwordConfirmChanged = 
        document.getElementById('passwordConfirmInput').value.trim() !== "";

      const hasUnsavedChanges = passwordChanged || passwordConfirmChanged;

      confirmBack('main.html', hasUnsavedChanges, '수정 사항이 저장되지 않습니다.');
    };
  }
}

// ==================== 초기화 ====================

async function init() {  
  await initHeader();

  setupBackButton();
  setupPasswordEvents();
  setupPasswordConfirmEvents();
  setupSubmitEvent();

  updateButtonState(formValidation);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('password_edit.js 로드 완료');