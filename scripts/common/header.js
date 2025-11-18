/**
 * 공통 헤더 초기화
 */

// ✅ 기본 프로필 이미지 경로 (서버 제공)
const DEFAULT_PROFILE_IMAGE = '/images/default-profile.png';

/**
 * 헤더 초기화 함수
 */
async function initHeader() {
  console.log('📋 헤더 초기화 중...');
  
  // 프로필 이미지 로드
  await loadHeaderProfile();
  
  // 드롭다운 메뉴 이벤트
  setupDropdownMenu();
  
  console.log('✅ 헤더 초기화 완료');
}

/**
 * 프로필 이미지 로드
 */
async function loadHeaderProfile() {
  const profileMenu = document.getElementById('profileMenu');
  if (!profileMenu) return;
  
  const profileAvatar = profileMenu.querySelector('.profile-avatar');
  if (!profileAvatar) return;
  
  try {
    const response = await getMyInfo();
    const userData = response.data;
    
    console.log('사용자 정보:', userData);
    
    // ✅ 프로필 이미지 설정
    let imageUrl;
    if (userData.profileImage) {
      // 사용자 이미지가 있으면
      imageUrl = `${API_BASE_URL}${userData.profileImage}`;
    } else {
      // 없으면 기본 이미지
      imageUrl = DEFAULT_PROFILE_IMAGE;
    }
    
    profileAvatar.innerHTML = `<img src="${imageUrl}" alt="프로필">`;
    
  } catch (error) {
    console.error('프로필 로드 실패:', error);
    // 에러 시 기본 이미지
    profileAvatar.innerHTML = `<img src="${DEFAULT_PROFILE_IMAGE}" alt="프로필">`;
  }
}

/**
 * 드롭다운 메뉴 이벤트 설정
 */
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

/**
 * 로그아웃
 */
function logout() {
  showModal(
    '로그아웃 하시겠습니까?',
    '',
    function() {
      console.log('🚪 로그아웃');
      
      // 토큰 삭제
      removeAccessToken();
      localStorage.removeItem('refreshToken');
      
      // 로그인 페이지로 이동
      navigateTo('login.html');
    }
  );
}

console.log('common/header.js 로드 완료');