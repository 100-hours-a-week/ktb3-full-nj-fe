// ==================== Import ====================

import { 
  getClub,
  getPendingApplications,
  approveApplication,
  rejectApplication
} from '../common/api/club.js';

import { API_BASE_URL } from '../common/api/core.js';

import { 
  showToast, 
  showModal, 
  navigateTo, 
  smartBack 
} from '../common/util/utils.js';

import { formatDate } from '../common/util/format.js';

import { getImageUrl } from '../common/util/image_util.js';

import { initHeader } from '../common/component/header.js';

// ==================== 상태 관리 ====================

let currentClubId = null;
let applications = [];

// ==================== URL 파라미터 ====================

function getClubIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get('id');
  return clubId ? Number(clubId) : null;
}

// ==================== 렌더링 ====================

function renderApplications(list = applications) {
  const container = document.getElementById('applicationsList');
  if (!container) return;

  if (list.length === 0) {
    renderEmptyState();
    return;
  }

  container.innerHTML = list.map(app => {
    const profileImg = app.profileImage 
      ? `${API_BASE_URL}${app.profileImage}` 
      : '/images/default-profile.png';

    const applicationDate = new Date(app.createdAt).toLocaleDateString('ko-KR');

    return `
      <div class="application-card" data-user-id="${app.userId}">
        <div class="user-info">
          <img src="${profileImg}" alt="프로필" class="profile-image">
          <div class="user-details">
            <div class="user-name">${app.nickname}</div>
            <div class="user-email">${app.userEmail || ''}</div>
            <div class="application-date">신청일: ${applicationDate}</div>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary approve-btn" data-user-id="${app.userId}">
            승인
          </button>
          <button class="btn btn-outline reject-btn" data-user-id="${app.userId}">
            거절
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderEmptyState() {
  const container = document.getElementById('applicationsList');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">😂</div>
      <div class="empty-state-text">신청 목록을 불러올 수 없습니다</div>
    </div>
  `;
}

// ==================== 이벤트 핸들러 ====================

function setupApplicationActions() {
  const container = document.getElementById('applicationsList');
  if (!container) return;

  container.addEventListener('click', async (e) => {
    // 승인 버튼
    if (e.target.closest('.approve-btn')) {
      const userId = Number(e.target.closest('.approve-btn').dataset.userId);
      await handleApprove(userId);
      return;
    }

    // 거절 버튼
    if (e.target.closest('.reject-btn')) {
      const userId = Number(e.target.closest('.reject-btn').dataset.userId);
      await handleReject(userId);
      return;
    }
  });
}

async function handleApprove(userId) {
  showModal(
    '가입 승인',
    '이 사용자의 가입을 승인하시겠습니까?',
    async () => {
      try {
        const response = await approveApplication(currentClubId, userId);
        showToast(response.message || '가입이 승인되었습니다');

        // 목록 다시 로드
        await loadApplications();

      } catch (error) {
        console.error('승인 실패:', error);

        if (error.status === 401) {
          showToast('로그인이 필요합니다');
          setTimeout(() => navigateTo('login.html'), 1500);
        } else if (error.status === 403) {
          showToast('권한이 없습니다', 2000, 'error');
        } else {
          showToast(error.message || '승인 중 오류가 발생했습니다', 2000, 'error');
        }
      }
    }
  );
}

async function handleReject(userId) {
  showModal(
    '가입 거절',
    '이 사용자의 가입을 거절하시겠습니까?',
    async () => {
      try {
        const response = await rejectApplication(currentClubId, userId);
        showToast(response.message || '가입이 거절되었습니다');

        // 목록 다시 로드
        await loadApplications();

      } catch (error) {
        console.error('거절 실패:', error);

        if (error.status === 401) {
          showToast('로그인이 필요합니다');
          setTimeout(() => navigateTo('login.html'), 1500);
        } else if (error.status === 403) {
          showToast('권한이 없습니다', 2000, 'error');
        } else {
          showToast(error.message || '거절 중 오류가 발생했습니다', 2000, 'error');
        }
      }
    }
  );
}

function setupBackButton() {
  const backBtn = document.querySelector('.header-back');
  if (!backBtn) return;

  backBtn.onclick = () => {
    smartBack(`club_detail.html?id=${currentClubId}`);
  };
}

// ==================== 데이터 로드 ====================

async function loadClubName() {
  try {
    const response = await getClub(currentClubId);
    const club = response.data;

    const nameEl = document.getElementById('clubName');
    if (nameEl && club) {
      nameEl.textContent = club.clubName;
    }

  } catch (error) {
    console.error('클럽 이름 로드 실패:', error);
  }
}

async function loadApplications() {
  const container = document.getElementById('applicationsList');
  if (!container) return;

  container.innerHTML = '<div class="loading-message">로딩 중...</div>';

  try {
    const response = await getPendingApplications(currentClubId);
    applications = response.data || [];

    console.log('신청 목록:', applications);
    renderApplications(applications);

  } catch (error) {
    console.error('신청 목록 로드 실패:', error);

    if (error.status === 401) {
      showToast('로그인이 필요합니다');
      setTimeout(() => navigateTo('login.html'), 1500);
    } else if (error.status === 403) {
      showToast('권한이 없습니다', 2000, 'error');
      setTimeout(() => navigateTo(`club_detail.html?id=${currentClubId}`), 1500);
    } else {
      renderEmptyState();
    }
  }
}

// ==================== 초기화 ====================

async function init() {
  console.log('가입 신청 관리 페이지 초기화');

  await initHeader();

  setupBackButton();
  setupApplicationActions();

  currentClubId = getClubIdFromUrl();
  if (!currentClubId) {
    console.error('clubId 없음');
    showToast('잘못된 접근입니다', 2000, 'error');
    smartBack('club_list.html');
    return;
  }

  await loadClubName();
  await loadApplications();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('clubs/applications.js 로드 완료');