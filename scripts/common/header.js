// 공통 헤더 초기화

// 프로필 이미지 로드
async function loadHeaderProfile() {
  const profileMenu = document.getElementById('profileMenu');
  if (!profileMenu) return;
  
  const profileAvatar = profileMenu.querySelector('.profile-avatar');
  if (!profileAvatar) return;
  
  try {
    const response = await getMyInfo();
    const userData = response.data;
    
    console.log('사용자 정보:', userData);
    
    const profileImageUrl = getImageUrl(userData.profileImage);
    profileAvatar.innerHTML = `<img src="${profileImageUrl}" alt="프로필">`;
    
  } catch (error) {
    console.error('프로필 로드 실패:', error);
  }
}

// 드롭다운 메뉴 이벤트 설정
function setupDropdownMenu() {
  const profileMenu = document.getElementById('profileMenu');
  const dropdownMenu = document.getElementById('dropdownMenu');
  
  if (!profileMenu || !dropdownMenu) return;
  
  // 프로필 메뉴 클릭
  profileMenu.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
  });
  
  // 외부 클릭 시 메뉴 닫기
  document.addEventListener('click', function() {
    dropdownMenu.classList.remove('active');
  });
  
  console.log('드롭다운 메뉴 이벤트 설정 완료');
}

// 로그아웃
async function logout() {
  showModal(
    '로그아웃 하시겠습니까?',
    '',
    async () => {
      try {
        console.log('로그아웃 시도');
        
        await apiRequest('/auth/logout', {
          method: 'POST'
        });
        
        console.log('로그아웃 성공');
        
        removeToken();
        showToast('로그아웃 되었습니다');
        
        setTimeout(() => {
          navigateTo('login.html');
        }, 1000);
        
      } catch (error) {
        console.error('로그아웃 실패:', error);
        
        removeToken();
        showToast('로그아웃 처리 중 오류가 발생했습니다', 2000, 'error');
        
        setTimeout(() => {
          navigateTo('login.html');
        }, 1000);
      }
    }
  );
}

// 헤더 초기화 함수
async function initHeader() {
  console.log('헤더 불러오는 중');
  
  await loadHeaderProfile();
  setupDropdownMenu();
  
  console.log('헤더 로딩 완료');
}

console.log('common/header.js 로드 완료');