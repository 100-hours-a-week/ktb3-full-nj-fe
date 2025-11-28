// ==================== Import ====================

import { getClub } from '../common/api/club.js';
import { API_BASE_URL } from '../common/api/core.js';

import { 
  showToast, 
  showModal, 
  navigateTo, 
  smartBack 
} from '../common/util/utils.js';

import { formatDate } from '../common/util/format.js';

import { initHeader } from '../common/component/header.js';

// ==================== 더미 데이터 (임시) ====================

const DUMMY_DATA = {
  totalMembers: 45,
  newMembers: 12,
  performances: 15,

  gallery: [
    { id: 1, placeholder: '📸' },
    { id: 2, placeholder: '🎬' },
    { id: 3, placeholder: '🎤' },
    { id: 4, placeholder: '🎭' },
    { id: 5, placeholder: '💃' },
    { id: 6, placeholder: '🕺' },
    { id: 7, placeholder: '🎵' },
    { id: 8, placeholder: '⚡' }
  ],

  leaders: [
    { name: '김동아', role: '회장', avatar: '👤' },
    { name: '이댄스', role: '부회장', avatar: '👤' },
    { name: '박리듬', role: '총무', avatar: '👤' }
  ],

  recentActivities: [
    {
      id: 1,
      title: '2024 가을 정기공연 성황리 종료',
      description: '지난 11월 15일, 학생회관 대강당에서 진행된 가을 정기공연이 성황리에 종료되었습니다. 200명 이상의 관객이 참석해주셨습니다.',
      date: '2024-11-16',
      image: '🎉'
    },
    {
      id: 2,
      title: '신입생 오리엔테이션 진행',
      description: '2024년 하반기 신입생 12명을 대상으로 오리엔테이션을 진행했습니다. 앞으로의 활동이 기대됩니다!',
      date: '2024-11-10',
      image: '👋'
    },
    {
      id: 3,
      title: '전국 대학 댄스 페스티벌 2위 수상',
      description: '10월 말에 진행된 전국 대학 댄스 페스티벌에서 우수한 성적으로 2위를 차지했습니다.',
      date: '2024-10-28',
      image: '🏆'
    }
  ],

  contact: {
    email: 'club@univ.ac.kr',
    instagram: '@club_official',
    website: 'https://club.example.com',
    kakao: '카카오톡 오픈채팅'
  }
};

// ==================== 상태 관리 ====================

let currentClub = null;
let isMember = false;

// ==================== URL 파라미터 ====================

function getClubIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get('id');
  return clubId ? Number(clubId) : null;
}

// ==================== 렌더링 ====================

function renderClubDetail(club) {
  console.log('클럽 상세 렌더링:', club);

  renderBasicInfo(club);
  renderMetaInfo(club);
  renderTags(club.tags);
  renderStats(club.memberCount);
  renderGallery(club.gallery);
  renderLeadership(club.leaders);
  renderActivities(club.recentActivities);
  renderContact(club.contact);
  
  updateJoinButtonText(club.isMine === true);
}

function renderBasicInfo(club) {
  const nameEl = document.getElementById('clubName');
  const subtitleEl = document.getElementById('clubSubtitle');
  const descEl = document.getElementById('clubDescription');
  const logoEl = document.getElementById('clubLogoLarge');
  const badgeEl = document.getElementById('clubBadge');

  if (nameEl) {
    nameEl.textContent = club.clubName || '동아리 이름';
  }

  if (subtitleEl) {
    subtitleEl.textContent = club.intro || '';
  }

  if (descEl) {
    const text = club.description || '';
    descEl.innerHTML = text.replace(/\n/g, '<br>');
  }

  if (logoEl) {
    if (club.clubImage) {
      const imgUrl = `${API_BASE_URL}${club.clubImage}`;
      logoEl.innerHTML = `<img src="${imgUrl}" alt="${club.clubName}">`;
    } else {
      const initial =
        (club.clubName && club.clubName.trim().charAt(0)) ||
        (club.intro && club.intro.trim().charAt(0)) ||
        'C';
      logoEl.textContent = initial;
      logoEl.classList.add('club-logo-initial');
    }
  }

  if (badgeEl) {
    badgeEl.style.display = club.isMine === true ? 'inline-block' : 'none';
  }
}

function renderMetaInfo(club) {
  const metaEl = document.querySelector('.club-meta');
  if (!metaEl) return;

  const members = club.memberCount ?? DUMMY_DATA.totalMembers;
  const location = club.locationName || '위치 미등록';

  metaEl.innerHTML = `
    <span class="meta-item">👥 ${members}명</span>
    <span class="meta-divider">|</span>
    <span class="meta-item">📍 ${location}</span>
  `;
}

function renderTags(tags) {
  const tagsEl = document.querySelector('.club-tags-large');
  if (!tagsEl) return;

  const tagList = tags || [];
  
  if (tagList.length === 0) {
    tagsEl.innerHTML = `<span class="tag-large tag-empty">태그 없음</span>`;
  } else {
    tagsEl.innerHTML = tagList
      .map(tag => `<span class="tag-large">${tag}</span>`)
      .join('');
  }
}

function renderStats(memberCount) {
  const statsEl = document.querySelector('.members-stats');
  if (!statsEl) return;

  const totalMembers = memberCount ?? DUMMY_DATA.totalMembers;
  const newMembers = DUMMY_DATA.newMembers;
  const performances = DUMMY_DATA.performances;

  statsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-number">${totalMembers}</div>
      <div class="stat-label">전체 멤버</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${newMembers}</div>
      <div class="stat-label">신입 멤버</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">${performances}</div>
      <div class="stat-label">공연 횟수</div>
    </div>
  `;
}

function renderGallery(gallery) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const source =
    gallery && Array.isArray(gallery) && gallery.length > 0
      ? gallery
      : DUMMY_DATA.gallery;

  grid.innerHTML = source
    .map(item => `
      <div class="gallery-item">
        ${
          item.imageUrl
            ? `<img src="${API_BASE_URL}${item.imageUrl}" alt="gallery">`
            : `<div class="gallery-placeholder">${item.placeholder || '📸'}</div>`
        }
      </div>
    `)
    .join('');
}

function renderLeadership(leaders) {
  const grid = document.querySelector('.leadership-grid');
  if (!grid) return;

  const source =
    leaders && Array.isArray(leaders) && leaders.length > 0
      ? leaders
      : DUMMY_DATA.leaders;

  grid.innerHTML = source
    .map(leader => `
      <div class="leader-card">
        <div class="leader-avatar">${leader.avatar || '👤'}</div>
        <div class="leader-info">
          <div class="leader-name">${leader.name || '운영진'}</div>
          <div class="leader-role">${leader.role || ''}</div>
        </div>
      </div>
    `)
    .join('');
}

function renderActivities(activities) {
  const list = document.getElementById('activityList');
  if (!list) return;

  const source =
    activities && Array.isArray(activities) && activities.length > 0
      ? activities
      : DUMMY_DATA.recentActivities;

  list.innerHTML = source
    .map(activity => `
      <div class="activity-item" data-post-id="${activity.id}">
        <div class="activity-image">
          ${
            activity.imageUrl
              ? `<img src="${API_BASE_URL}${activity.imageUrl}" alt="${activity.title}">`
              : `<div class="gallery-placeholder">${activity.image || '📝'}</div>`
          }
        </div>
        <div class="activity-info">
          <h3 class="activity-title">${activity.title}</h3>
          <p class="activity-description">${activity.description}</p>
          <span class="activity-date">${formatDate(activity.date)}</span>
        </div>
      </div>
    `)
    .join('');
}

function renderContact(contact) {
  const grid = document.querySelector('.contact-grid');
  if (!grid) return;

  const src = { ...DUMMY_DATA.contact, ...(contact || {}) };

  grid.innerHTML = `
    <div class="contact-item">
      <div class="contact-icon">✉️</div>
      <div class="contact-info">
        <div class="contact-label">이메일</div>
        <div class="contact-value">${src.email || '-'}</div>
      </div>
    </div>
    <div class="contact-item">
      <div class="contact-icon">📸</div>
      <div class="contact-info">
        <div class="contact-label">인스타그램</div>
        <div class="contact-value">${src.instagram || '-'}</div>
      </div>
    </div>
    <div class="contact-item">
      <div class="contact-icon">🌐</div>
      <div class="contact-info">
        <div class="contact-label">웹사이트</div>
        <div class="contact-value">${src.website || '-'}</div>
      </div>
    </div>
    <div class="contact-item">
      <div class="contact-icon">💬</div>
      <div class="contact-info">
        <div class="contact-label">카카오톡</div>
        <div class="contact-value">${src.kakao || '-'}</div>
      </div>
    </div>
  `;
}

function renderEmptyClub() {
  const container = document.querySelector('.detail-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">🎭</div>
      <div class="empty-state-text">동아리 정보를 찾을 수 없습니다</div>
    </div>
  `;
}

function renderErrorState() {
  const container = document.querySelector('.detail-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <div class="empty-state-text">동아리 정보를 불러오는 중 오류가 발생했습니다</div>
      <button class="btn btn-primary" style="margin-top: 20px; width: auto;" id="retryBtn">
        다시 시도
      </button>
    </div>
  `;
  
  const retryBtn = document.getElementById('retryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => location.reload());
  }
}

function updateJoinButtonText(isMine) {
  const joinBtn = document.getElementById('joinBtn');
  if (!joinBtn) return;

  if (isMine) {
    joinBtn.textContent = '탈퇴하기';
    joinBtn.classList.add('btn-outline');
  } else {
    joinBtn.textContent = '가입 신청';
    joinBtn.classList.remove('btn-outline');
  }
}

// ==================== 이벤트 핸들러 ====================

function setupJoinButton() {
  const joinBtn = document.getElementById('joinBtn');
  if (!joinBtn) return;
  
  joinBtn.addEventListener('click', () => {
    if (isMember) {
      showModal(
        '동아리 탈퇴',
        '정말 탈퇴하시겠습니까?',
        () => {
          // TODO: 실제 탈퇴 API 연동
          showToast('탈퇴되었습니다');
          isMember = false;
          updateJoinButtonText(false);
        }
      );
    } else {
      showModal(
        '동아리 가입',
        '가입 신청을 하시겠습니까?',
        () => {
          // TODO: 실제 가입 API 연동
          showToast('가입 신청이 완료되었습니다');
        }
      );
    }
  });
}

function setupShareButton() {
  const shareBtn = document.getElementById('shareBtn');
  if (!shareBtn) return;
  
  shareBtn.addEventListener('click', () => {
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => showToast('링크가 복사되었습니다'))
        .catch(() => showToast('링크 복사에 실패했습니다', 2000, 'error'));
    } else {
      showToast('링크 복사 기능을 사용할 수 없습니다', 2000, 'error');
    }
  });
}

function setupActivityClick() {
  const list = document.getElementById('activityList');
  if (!list) return;
  
  list.addEventListener('click', (e) => {
    const item = e.target.closest('.activity-item');
    if (!item) return;
    
    const postId = item.dataset.postId;
    if (postId) {
      console.log('게시글 이동:', postId);
      navigateTo(`post_detail.html?id=${postId}`);
    }
  });
}

function setupBackButton() {
  const backBtn = document.querySelector('.header-back');
  if (!backBtn) return;
  
  backBtn.onclick = () => smartBack('club_list.html');
}

// ==================== 데이터 로드 ====================

async function loadClubDetail(clubId) {
  console.log('클럽 상세 조회:', clubId);
  
  try {
    const response = await getClub(clubId);
    const club = response.data;

    if (!club) {
      console.warn('클럽 데이터 없음');
      renderEmptyClub();
      return;
    }

    currentClub = club;
    isMember = club.isMine === true;
    
    renderClubDetail(club);

  } catch (error) {
    console.error('클럽 상세 로드 실패:', error);
    
    if (error.status === 404) {
      renderEmptyClub();
    } else if (error.status === 401) {
      showToast('로그인이 필요합니다');
      setTimeout(() => navigateTo('login.html'), 1500);
    } else {
      renderErrorState();
    }
  }
}

// ==================== 초기화 ====================

async function init() {
  console.log('클럽 상세 페이지 초기화');

  await initHeader();

  setupBackButton();
  setupJoinButton();
  setupShareButton();
  setupActivityClick();

  const clubId = getClubIdFromUrl();
  if (!clubId) {
    console.error('clubId 없음');
    showToast('잘못된 접근입니다', 2000, 'error');
    smartBack('club_list.html');
    return;
  }

  await loadClubDetail(clubId);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('clubs/detail.js 로드 완료');