// 클럽 상세

// 더미 데이터
const dummyClubDetail = {
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

// URL에서 clubId 추출
function getClubIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get('id');
  return clubId ? Number(clubId) : null;
}

// 가입 버튼 상태 업데이트
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

// 클럽 상세 정보 로드
async function loadClubDetail(clubId) {
  console.log('클럽 상세 조회:', clubId);
  
  const loading = document.getElementById('loadingIndicator');

  try {
    if (loading) loading.style.display = 'block';

    const response = await getClub(clubId);
    const club = response.data;

    if (!club) {
      console.warn('클럽 데이터 없음');
      renderEmptyClub();
      return;
    }

    renderClubDetail(club);

  } catch (error) {
    console.error('클럽 상세 로드 실패:', error);
    renderErrorState();
  } finally {
    if (loading) loading.style.display = 'none';
  }
}

// 클럽 상세 정보 렌더링
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

// 기본 정보 렌더링
function renderBasicInfo(club) {
  const nameEl = document.getElementById('clubName');
  const subtitleEl = document.getElementById('clubSubtitle');
  const descEl = document.getElementById('clubDescription');
  const logoEl = document.getElementById('clubLogoLarge');
  const badgeEl = document.getElementById('clubBadge');

  // 이름
  if (nameEl) {
    nameEl.textContent = club.clubName || '동아리 이름';
  }

  // 한 줄 소개
  if (subtitleEl) {
    subtitleEl.textContent = club.intro || '';
  }

  // 상세 설명
  if (descEl) {
    const text = club.description || '';
    descEl.innerHTML = text.replace(/\n/g, '<br>');
  }

  // 로고
  if (logoEl) {
    if (club.clubImage) {
      const imgUrl = `${API_BASE_URL}${club.clubImage}`;
      logoEl.innerHTML = `<img src="${imgUrl}" alt="${club.clubName}">`;
    } else {
      // 이미지 없으면 이니셜 표시
      const initial =
        (club.clubName && club.clubName.trim().charAt(0)) ||
        (club.intro && club.intro.trim().charAt(0)) ||
        'C';
      logoEl.textContent = initial;
      logoEl.classList.add('club-logo-initial');
    }
  }

  // "내 동아리" 뱃지
  if (badgeEl) {
    badgeEl.style.display = club.isMine === true ? 'inline-block' : 'none';
  }
}

// 메타 정보 렌더링
function renderMetaInfo(club) {
  const metaEl = document.querySelector('.club-meta');
  if (!metaEl) return;

  const members = club.memberCount ?? dummyClubDetail.totalMembers;
  const location = club.locationName || '위치 미등록';

  metaEl.innerHTML = `
    <span class="meta-item">👥 ${members}명</span>
    <span class="meta-divider">|</span>
    <span class="meta-item">📍 ${location}</span>
  `;
}

// 태그 렌더링
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

// 통계 렌더링
function renderStats(memberCount) {
  const statsEl = document.querySelector('.members-stats');
  if (!statsEl) return;

  const totalMembers = memberCount ?? dummyClubDetail.totalMembers;
  const newMembers = dummyClubDetail.newMembers;
  const performances = dummyClubDetail.performances;

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

// 갤러리 렌더링
function renderGallery(gallery) {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const source =
    gallery && Array.isArray(gallery) && gallery.length > 0
      ? gallery
      : dummyClubDetail.gallery;

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

// 운영진 렌더링
function renderLeadership(leaders) {
  const grid = document.querySelector('.leadership-grid');
  if (!grid) return;

  const source =
    leaders && Array.isArray(leaders) && leaders.length > 0
      ? leaders
      : dummyClubDetail.leaders;

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

// 최근 활동 렌더링
function renderActivities(activities) {
  const list = document.getElementById('activityList');
  if (!list) return;

  const source =
    activities && Array.isArray(activities) && activities.length > 0
      ? activities
      : dummyClubDetail.recentActivities;

  list.innerHTML = source
    .map(activity => `
      <div class="activity-item" onclick="goToPost(${activity.id})">
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

// 연락처 렌더링
function renderContact(contact) {
  const grid = document.querySelector('.contact-grid');
  if (!grid) return;

  const src = { ...dummyClubDetail.contact, ...(contact || {}) };

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

// 빈 상태 렌더링
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

// 에러 상태 렌더링
function renderErrorState() {
  const container = document.querySelector('.detail-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <div class="empty-state-text">동아리 정보를 불러오는 중 오류가 발생했습니다</div>
      <button class="btn btn-primary" style="margin-top: 20px; width: auto;" onclick="location.reload()">
        다시 시도
      </button>
    </div>
  `;
}

// 가입 버튼 클릭
function handleJoinClick() {
  showModal(
    '동아리 가입',
    '가입 신청을 하시겠습니까?',
    () => {
      // TODO: 실제 가입 API 연동
      showToast('가입 신청이 완료되었습니다');
    }
  );
}

// 공유 버튼 클릭
function handleShareClick() {
  const url = window.location.href;
  
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(url)
      .then(() => showToast('링크가 복사되었습니다'))
      .catch(() => showToast('링크 복사에 실패했습니다', 2000, 'error'));
  } else {
    showToast('링크 복사 기능을 사용할 수 없습니다', 2000, 'error');
  }
}

// 게시글로 이동
function goToPost(postId) {
  console.log('게시글 이동:', postId);
  navigateTo(`post_detail.html?id=${postId}`);
}

// 버튼 이벤트 설정
function setupButtons() {
  const joinBtn = document.getElementById('joinBtn');
  const shareBtn = document.getElementById('shareBtn');

  if (joinBtn) {
    joinBtn.addEventListener('click', handleJoinClick);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', handleShareClick);
  }
}

// 뒤로가기 버튼 설정
function setupBackButton() {
  const backBtn = document.querySelector('.header-back');
  if (backBtn) {
    backBtn.onclick = () => smartBack('club_list.html');
  }
}

// 페이지 초기화
async function initClubDetailPage() {
  console.log('클럽 상세 페이지 초기화');

  setupBackButton();
  setupButtons();

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
  document.addEventListener('DOMContentLoaded', initClubDetailPage);
} else {
  initClubDetailPage();
}

console.log('clubs/detail.js 로드 완료');