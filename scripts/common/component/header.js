// ==================== Import ====================

import { getMyInfo } from '../api/user.js';
import { logout as apiLogout } from '../api/auth.js';

import { 
  showModal, 
  showToast, 
  navigateTo 
} from '../util/utils.js';

import { getImageUrl } from '../util/image_util.js';

// ==================== 헤더 초기화 ====================

// 프로필 이미지 로드
async function loadHeaderProfile() {
  const profileMenu = document.getElementById('profileMenu');
  if (!profileMenu) return;
  
  const profileAvatar = profileMenu.querySelector('.profile-avatar');
  if (!profileAvatar) return;
  
  try {
    const response = await getMyInfo();
    const userData = response.data;
    
    const profileImageUrl = getImageUrl(userData.profileImage, 'profile');
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
  
  profileMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('active');
  });

  dropdownMenu.addEventListener('click', async (e) => {
    const item = e.target.closest('.dropdown-item');
    if (!item) return;
    
    const navUrl = item.dataset.nav;
    const action = item.dataset.action;
    
    dropdownMenu.classList.remove('active');
    
    if (navUrl) {
      navigateTo(navUrl);
    } else if (action === 'logout') {
      await logout();
    }
  });
  
  // 외부 클릭 시 메뉴 닫기
  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('active');
  });
  
  console.log('드롭다운 메뉴 이벤트 설정 완료');
}

// 로그아웃 (UI 처리 및 auth 모듈 호출)
export async function logout() {
  showModal(
    '로그아웃 하시겠습니까?',
    '',
    async () => {
      try {
        await apiLogout();
        showToast('로그아웃 되었습니다');
        setTimeout(() => navigateTo('login.html'), 1000);
      } catch (error) {
        console.error('로그아웃 실패:', error);
        showToast('로그아웃 처리 중 오류가 발생했습니다', 2000, 'error');
        setTimeout(() => navigateTo('login.html'), 1000);
      }
    }
  );
}

// 헤더 초기화 (export)
export async function initHeader() {  
  await loadHeaderProfile();
  setupDropdownMenu();
}

console.log('common/component/header.js 로드 완료');