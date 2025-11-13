// 프로필 수정 로직

// Mock 사용자 데이터 & 중복 닉네임 목록
const mockUserData = {
  email: 'startupcode@gmail.com',
  nickname: '스타트업코드',
  profileImage: null
};
const mockDuplicateNicknames = ['테스트', '관리자', 'admin', '운영자'];

// 프로필 수정 폼 검증 상태
const formValidation = {
    profileImage: false,
    nickname: false
};

// 닉네임 중복 체크 (회원정보수정 전용) -> TODO : api 연동 변경 예정
function checkNicknameDuplicate(nickname) {
  console.log('🔍 중복 체크:', nickname);
  
  // Mock 중복 체크
  if (mockDuplicateNicknames.includes(nickname)) {
    showError('nicknameInput', '*중복된 닉네임 입니다');
    formValidation.nickname = false;
    return false;
  }
  
  // Phase 2: 실제 API 호출
  // const response = await fetch(`/api/user/check-nickname?nickname=${nickname}`);
  // const data = await response.json();
  // if (data.isDuplicate) {
  //   showError('nicknameInput', '*중복된 닉네임 입니다');
  //   formValidation.nickname = false;
  //   return false;
  // }
  
  return true;
}

// 프로필 이미지 수정 이벤트
let profileImageFile = null;

function setupProfileImageEvent() {
  console.log('회원 정보 수정 : 프로필 이미지 처리 중');

  const profileImageContainer = document.getElementById('profileImageContainer');
  if (profileImageContainer) {
    profileImageContainer.addEventListener('click', function() {
      document.getElementById('profileUpload').click();
    });
  }
  
  document.getElementById('profileUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      profileImageFile = file;
      const reader = new FileReader();
      reader.onload = function(e) {
        const profileImageDiv = document.getElementById('profileImage');
        if (profileImageDiv) {
            profileImageDiv.innerHTML = `<img src="${e.target.result}">`;
        }
        
        formValidation.profileImage = true;
      };
      reader.readAsDataURL(file);
    }
  });
}

// 닉네임 수정 이벤트
function setupNicknameEvents() {
  console.log('회원 정보 수정 : 닉네임 처리 중');  

  document.getElementById('nicknameInput').addEventListener('blur', function() {
    validateNickname(this.value.trim(),formValidation);
    checkNicknameDuplicate(this.value.trim());
  });

  document.getElementById('nicknameInput').addEventListener('input', function() {
    if (this.value) clearError('nicknameInput');
  });
}

// 회원 정보 수정 진행
function setupEditButtonEvent() {
  console.log('수정하기 버튼 이벤트 등록...');
  
  // form submit 이벤트
  document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('회원 정보 수정 시도!');
    
    const nickname = document.getElementById('nicknameInput').value.trim();
    
    // 검증 1: 기본 검증
    if (!validateNickname(nickname, formValidation)) {
      console.log('검증 실패: 기본 검증');
      return;
    }
    
    // 검증 2: 중복 체크
    if (!checkNicknameDuplicate(nickname)) {
      console.log('검증 실패: 중복된 닉네임');
      return;
    }
    
    console.log('검증 통과!');
    
    // Phase 1: Mock 처리
    console.log('수정할 데이터:', {
      nickname,
      profileImage: profileImageFile ? profileImageFile.name : '변경 없음'
    });
    
    // 로딩 상태
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = '수정 중...';
    
    // 1초 후 완료 (Mock)
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = '수정하기';
      
      // 성공 토스트
      showToast('수정 완료');
      
      console.log('수정 완료!');
      
      // Phase 2: 실제 API 호출
      // const formData = new FormData();
      // formData.append('nickname', nickname);
      // if (profileImageFile) {
      //   formData.append('profileImage', profileImageFile);
      // }
      // const result = await fetch('/api/user/profile', {
      //   method: 'PATCH',
      //   body: formData
      // });
    }, 1000);
  });
}


// 회원 탈퇴 버튼
function setupDeleteAccountEvent() {
  console.log('🗑️ 회원 탈퇴 버튼 이벤트 등록...');
  
  const deleteBtn = document.querySelector('.btn-secondary');
  if (deleteBtn) {
    // 기존 onclick 제거
    deleteBtn.removeAttribute('onclick');
    
    deleteBtn.addEventListener('click', function() {
      console.log('회원 탈퇴 클릭');
      
      // 확인 모달
      showModal(
        '회원탈퇴 하시겠습니까?',
        '작성된 게시글과 댓글은 삭제됩니다.',
        function() {
          // 확인 클릭
          console.log('✅ 회원 탈퇴 확인');
          
          // Phase 1: Mock 처리
          setTimeout(() => {
            console.log('🚪 로그인 페이지로 이동');
            showToast('회원 탈퇴가 완료되었습니다');
            
            // 2초 후 로그인 페이지로
            setTimeout(() => {
              navigateTo('login.html');
            }, 2000);
          }, 500);
          
          // Phase 2: 실제 API 호출
          // await fetch('/api/user', { method: 'DELETE' });
          // removeFromStorage('token');
          // navigateTo('login.html');
        },
        function() {
          // 취소 클릭
          console.log('❌ 회원 탈퇴 취소');
        }
      );
    });
  }
}

// 사용자 정보 로드
function loadUserData() {
  console.log('회원정보 수정 : 사용자 정보 로드');
  
  // Mock 데이터 불러오기
  document.getElementById('emailDisplay').textContent = mockUserData.email;
  document.getElementById('nicknameInput').value = mockUserData.nickname;
  
  // 실제 API 호출
  // const user = await fetch('/api/user/me');
  // document.getElementById('emailDisplay').textContent = user.email;
  // document.getElementById('nicknameInput').value = user.nickname;
  // if (user.profileImage) {
  //   document.getElementById('profileImage').src = user.profileImage;
  // }
}

// 회원정보 수정 페이지 초기화
function init() {
  console.log('회원정보 수정 페이지 불러오는 중');
  
  loadUserData();
  setupProfileImageEvent();
  setupNicknameEvents();
  setupEditButtonEvent();
  setupDeleteAccountEvent();
  
  console.log('회원정보 수정 페이지 로딩 완료!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('profile/edit.js 로드 완료');