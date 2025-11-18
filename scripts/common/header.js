// 공통 헤더 초기화

// 기본 프로필 이미지 경로 (서버 제공)
const DEFAULT_PROFILE_IMAGE = '/images/default-profile.png';

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
    
    let imageUrl;
    if (userData.profileImage) {
      imageUrl = `${API_BASE_URL}${userData.profileImage}`;
    } else {
      imageUrl = DEFAULT_PROFILE_IMAGE;
    }
    
    profileAvatar.innerHTML = `<img src="${imageUrl}" alt="프로필">`;
    
  } catch (error) {
    console.error('프로필 로드 실패:', error);
    profileAvatar.innerHTML = `<img src="${DEFAULT_PROFILE_IMAGE}" alt="프로필">`;
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
function logout() {
  showModal(
    '로그아웃 하시겠습니까?',
    '',
    function() {
      console.log('로그아웃');
      removeToken();
      navigateTo('login.html');
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