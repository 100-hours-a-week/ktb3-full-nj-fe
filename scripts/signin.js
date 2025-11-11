// 회원가입 메인 로직

// 프로필 이미지 파일 저장
let profileImageFile = null;

// 이벤트 리스너 초기화
function initEventListeners() {
  console.log('이벤트 리스너 진행');
  
  // 프로필 이미지 업로드
  document.getElementById('profileUpload').addEventListener('click', function() {
    document.getElementById('profileInput').click();
  });
  
  document.getElementById('profileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      profileImageFile = file;
      
      const reader = new FileReader();
      reader.onload = function(e) {
        const profileUpload = document.getElementById('profileUpload');
        profileUpload.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        
        formValidation.profileImage = true;
        updateButtonState();
        
        // helper text 숨기기
        document.querySelector('.profile-upload-helper').style.display = 'none';
        
        console.log('프로필 이미지 업로드됨:', file.name);
      };
      reader.readAsDataURL(file);
    }
  });
  
  // ===== 이메일 =====
  document.getElementById('emailInput').addEventListener('blur', function() {
    validateEmail(this.value.trim());
    updateButtonState();
  });
  
  document.getElementById('emailInput').addEventListener('input', function() {
    if (this.value) clearError('emailInput');
  });
  
  // ===== 비밀번호 =====
  document.getElementById('passwordInput').addEventListener('blur', function() {
    validatePassword(this.value);
    updateButtonState();
  });
  
  document.getElementById('passwordInput').addEventListener('input', function() {
    if (this.value) clearError('passwordInput');
  });
  
  // ===== 비밀번호 확인 =====
  document.getElementById('passwordConfirmInput').addEventListener('blur', function() {
    validatePasswordConfirm(this.value);
    updateButtonState();
  });
  
  document.getElementById('passwordConfirmInput').addEventListener('input', function() {
    if (this.value) clearError('passwordConfirmInput');
  });
  
  // ===== 닉네임 =====
  document.getElementById('nicknameInput').addEventListener('blur', function() {
    validateNickname(this.value.trim());
    updateButtonState();
  });
  
  document.getElementById('nicknameInput').addEventListener('input', function() {
    if (this.value) clearError('nicknameInput');
  });
  
  // ===== 폼 제출 =====
  document.getElementById('signinForm').addEventListener('submit', handleSubmit);
  
  console.log('이벤트 리스너 등록 완료');
}

// 회원가입 
async function handleSubmit(e) {
  e.preventDefault();
  
  console.log('회원가입 시도');
  
  // 1. 데이터 수집
  const formData = {
    email: document.getElementById('emailInput').value.trim(),
    password: document.getElementById('passwordInput').value,
    passwordConfirm: document.getElementById('passwordConfirmInput').value,
    nickname: document.getElementById('nicknameInput').value.trim(),
    profileImage: profileImageFile
  };
  
  console.log('📝 폼 데이터:', {
    email: formData.email,
    nickname: formData.nickname,
    hasProfileImage: !!formData.profileImage
  });
  
  // 2. 최종 검증 (혹시 모를 직접 제출 방지)
  const isValid = 
    validateEmail(formData.email) &&
    validatePassword(formData.password) &&
    validatePasswordConfirm(formData.passwordConfirm) &&
    validateNickname(formData.nickname);
  
  if (!isValid) {
    console.log('검증 실패');
    return;
  }
  
  // 3. 프로필 이미지 체크
  if (!formData.profileImage) {
    document.querySelector('.profile-upload-helper').textContent = '*프로필 사진을 추가해주세요.';
    document.querySelector('.profile-upload-helper').style.display = 'block';
    document.querySelector('.profile-upload-helper').style.color = '#ff4444';
    console.log('프로필 이미지 없음');
    return;
  }
  
  console.log('모든 검증 통과');
  
  // 4. 로딩 상태
  setLoadingState(true);
  
  try {
    // 5. 중복 체크
    console.log('🔍 중복 체크 시작...');
    
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
    
    console.log('중복 체크 통과');
    
    // 6. 회원가입 API 호출
    const result = await signup(formData);
    
    if (result.success) {
      console.log('회원가입 완료!');
      alert(`환영합니다, ${result.user.nickname}님! \n회원가입이 완료되었습니다.`);
      
      // 로그인 페이지로 이동
      window.location.href = 'index.html';
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

// 초기화
function init() {
  console.log('회원가입 페이지 초기화...');
  
  // 이벤트 리스너 등록
  initEventListeners();
  
  // 초기 버튼 상태 (비활성)
  updateButtonState();
  
  console.log('회원가입 페이지 준비 완료!');
  console.log('테스트 가능한 중복 이메일: test@test.com, user@example.com');
  console.log('테스트 가능한 중복 닉네임: 배기, 테스트, admin');
}

// DOM 로드 완료 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('signin.js 로드 완료');