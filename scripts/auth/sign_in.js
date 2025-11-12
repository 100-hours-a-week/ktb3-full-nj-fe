// 회원가입 메인 로직

// 회원가입 폼 검증
const formValidation = {
  profileImage: false,
  email: false,
  password: false,
  passwordConfirm: false,
  nickname: false
};

// 프로필 이미지 입력 이벤트
let profileImageFile = null;

function setupProfileImageEvent() {
  console.log('회원가입 : 프로필 이미지 처리 중');

  document.getElementById('profileUpload').addEventListener('click', function() {
    document.getElementById('profileInput').click();
  });
  
  document.getElementById('profileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      profileImageFile = file;
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('profileUpload').innerHTML = 
          `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        
        formValidation.profileImage = true;
        updateButtonState(formValidation);
        
        document.querySelector('.profile-upload-helper').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });
}

// 이메일 입력 이벤트
function setupEmailEvents() {
  console.log('회원가입 : 이메일 처리 중');

  document.getElementById('emailInput').addEventListener('blur', function() {
    validateEmail(this.value.trim(), formValidation);
    updateButtonState(formValidation);
  });
  
  document.getElementById('emailInput').addEventListener('input', function() {
    if (this.value) clearError('emailInput');
  });
}

// 비밀번호 입력 이벤트
function setupPasswordEvents() {
  console.log('회원가입 : 비밀번호 입력 처리 중');
  const passwordInput = document.getElementById('passwordInput');

  passwordInput.addEventListener('blur', function() {
    validatePassword(this.value, formValidation);
    updateButtonState(formValidation);
  });
  
  passwordInput.addEventListener('input', function() {
    if (this.value) clearError('passwordInput');
  });
}

// 비밀번호 확인 입력 이벤트
function setupPasswordConfirmEvents() {
  console.log('회원가입 : 비밀번호 확인 입력 처리 중');

  document.getElementById('passwordConfirmInput').addEventListener('blur', function() {
    validatePasswordConfirm(this.value, formValidation);
    updateButtonState(formValidation);
  });
  
  document.getElementById('passwordConfirmInput').addEventListener('input', function() {
    if (this.value) clearError('passwordConfirmInput');
  });
}

// 닉네임 입력 이벤트
function setupNicknameEvents() {
  console.log('회원가입 : 닉네임 입력 처리 중');

  document.getElementById('nicknameInput').addEventListener('blur', function() {
    validateNickname(this.value.trim(), formValidation);
    updateButtonState(formValidation);
  });
  
  document.getElementById('nicknameInput').addEventListener('input', function() {
    if (this.value) clearError('nicknameInput');
  });
}
  
// 회원가입 폼 입력 이벤트
function setupFormSubmitEvent() {  
  console.log('회원가입 : 폼 처리 중');

  document.getElementById('signinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    handleSubmit();
  });
}

// 회원가입 진행
async function handleSubmit(e) {
  console.log('회원가입 시도');
  
  // 데이터 수집
  const formData = {
    email: document.getElementById('emailInput').value.trim(),
    password: document.getElementById('passwordInput').value,
    passwordConfirm: document.getElementById('passwordConfirmInput').value,
    nickname: document.getElementById('nicknameInput').value.trim(),
    profileImage: profileImageFile
  };
  
  // 최종 검증
  const isValid = 
    validateEmail(formData.email, formValidation) &&
    validatePassword(formData.password, formValidation) &&
    validatePasswordConfirm(formData.passwordConfirm, formValidation) &&
    validateNickname(formData.nickname, formValidation);
  
  if (!isValid) {
    console.log('검증 실패');
    return;
  }

  if (!formData.profileImage) {
    document.querySelector('.profile-upload-helper').textContent = '*프로필 사진을 추가해주세요.';
    document.querySelector('.profile-upload-helper').style.display = 'block';
    document.querySelector('.profile-upload-helper').style.color = '#ff4444';
    console.log('프로필 이미지 없음');
    return;
  }
  
  console.log('회원가입 : 모든 검증 통과');
  
  // 4. 로딩 상태
  setLoadingState(true);
  
  try {
    // TODO : 중복 체크 실제 api
    console.log('회원가입 : 이메일, 닉네임 중복 체크 중');
    
    const isEmailDuplicate = await checkEmailDuplicate(formData.email);
    if (isEmailDuplicate) {
      showError('emailInput', '*중복된 이메일 입니다.');
      setLoadingState(false);
      return;
    }
    
    const isNicknameDuplicate = await checkNicknameDuplicate(formData.nickname);
    if (isNicknameDuplicate) {
      showError('nicknameInput', '*중복된 닉네임 입니다.');
      setLoadingState(false);
      return;
    }
    
    console.log('회원가입 : 중복 체크 통과');
    
    // 6. 회원가입 API 호출
    const result = await signup(formData);
    
    if (result.success) {
      console.log('회원가입 완료!');
      alert(`환영합니다, ${result.user.nickname}님! \n회원가입이 완료되었습니다.`);
      
      // 로그인 페이지로 이동
      window.location.href = 'login.html';
    } else {
      console.log('회원가입 실패:', result.message);
      alert(result.message || '회원가입에 실패했습니다.');
    }
    
  } catch (error) {
    console.error('회원가입 오류:', error);
    alert('회원가입 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
  } finally {
    setLoadingState(false);
  }
}

// 회원가입 페이지 초기화
function init() {
  console.log('회원가입 페이지 불러오는 중');
  
  setupProfileImageEvent();
  setupEmailEvents();
  setupPasswordEvents();
  setupPasswordConfirmEvents();
  setupNicknameEvents();
  setupFormSubmitEvent();

  updateButtonState(formValidation);
  
  console.log('회원가입 페이지 로딩 완료!');
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('sign-in.js 로드 완료');