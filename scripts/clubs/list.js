// 클럽 목록

let currentFilter = 'all';
let currentSort = 'name';
let clubs = [];
let myClubIds = new Set();

// 클럽 목록 로드
async function loadClubs() {
  console.log('클럽 목록 로드');
  
  const grid = document.getElementById('clubsGrid');
  if (!grid) {
    console.warn('#clubsGrid 요소를 찾을 수 없습니다');
    return;
  }

  grid.innerHTML = '';

  try {
    const [allRes, myRes] = await Promise.allSettled([
      getClubs(),
      getMyClubs()
    ]);

    let apiClubs = [];

    // 전체 클럽 목록
    if (allRes.status === 'fulfilled') {
      apiClubs = allRes.value.data || [];
    } else {
      console.warn('전체 클럽 조회 실패:', allRes.reason);
    }

    // 내 클럽 목록
    if (myRes.status === 'fulfilled' && myRes.value.data) {
      const joins = myRes.value.data;
      myClubIds = new Set(
        joins
          .filter(j => j.status === 'ACTIVE')
          .map(j => j.clubId)
      );
    } else {
      console.warn('내 클럽 조회 실패 또는 없음:', myRes.reason);
      myClubIds = new Set();
    }

    // isMine 플래그 추가
    clubs = (apiClubs || []).map(c => ({
      ...c,
      isMine: myClubIds.has(c.clubId)
    }));

    applySort();

  } catch (error) {
    console.error('클럽 목록 로드 실패:', error);
    renderClubs([]);
  }
}

// 클럽 카드 렌더링
function renderClubs(list = clubs) {
  const grid = document.getElementById('clubsGrid');
  if (!grid) return;

  // 빈 상태
  if (!list || list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎭</div>
        <div class="empty-state-text">등록된 동아리가 없습니다</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(club => {
    const imgSrc = club.clubImage
      ? `${API_BASE_URL}${club.clubImage}`
      : null;

    return `
      <div class="club-card ${club.isMine ? 'my-club' : ''}" onclick="goToDetail(${club.clubId})">
        <div class="club-logo">
          ${
            imgSrc
              ? `<img src="${imgSrc}" alt="${club.clubName}">`
              : `<span class="club-logo-placeholder">C</span>`
          }
        </div>
        
        <div class="club-divider"></div>
        
        <div class="club-info">
          <h3 class="club-name">${club.clubName}</h3>
          <p class="club-subtitle">${club.intro || ''}</p>
          <p class="club-description">${club.description || ''}</p>
          <div class="club-tags">
            ${
              (club.tags || [])
                .map(tag => `<span class="club-tag">${tag}</span>`)
                .join('') || ''
            }
          </div>
        </div>
        
        <div class="club-arrow">
          <span class="club-arrow-icon">→</span>
        </div>
      </div>
    `;
  }).join('');
}

// 정렬 적용
function applySort() {
  console.log('정렬 적용:', currentSort);

  if (!clubs || clubs.length === 0) {
    renderClubs([]);
    return;
  }

  // 내 클럽은 항상 최상단
  const myClubList = clubs.filter(c => c.isMine);
  const otherClubs = clubs.filter(c => !c.isMine);

  // 나머지 클럽 정렬
  if (currentSort === 'name') {
    otherClubs.sort((a, b) => a.clubName.localeCompare(b.clubName, 'ko'));
  } else if (currentSort === 'name-desc') {
    otherClubs.sort((a, b) => b.clubName.localeCompare(a.clubName, 'ko'));
  } else if (currentSort === 'members') {
    otherClubs.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
  }

  clubs = [...myClubList, ...otherClubs];

  applyFilters();
}

// 필터 적용
function applyFilters() {
  console.log('필터 적용:', currentFilter);

  if (!clubs || clubs.length === 0) {
    renderClubs([]);
    return;
  }

  let filtered = [...clubs];

  if (currentFilter === 'club') {
    filtered = filtered.filter(c => c.clubType === 'CLUB');
  } else if (currentFilter === 'crew') {
    filtered = filtered.filter(c => c.clubType === 'CREW');
  } else if (currentFilter === 'my') {
    filtered = filtered.filter(c => c.isMine);
  }

  // 필터 결과 없음
  if (filtered.length === 0) {
    const grid = document.getElementById('clubsGrid');
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎭</div>
        <div class="empty-state-text">조건에 맞는 동아리가 없습니다</div>
      </div>
    `;
    return;
  }

  renderClubs(filtered);
}

// 필터/정렬 버튼 이벤트
function setupFilters() {
  // 필터 탭
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentFilter = tab.dataset.filter;
      applyFilters();
    });
  });

  // 정렬 버튼
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentSort = btn.dataset.sort;
      applySort();
    });
  });
}

// 클럽 생성 버튼
function setupCreateClubButton() {
  const btn = document.getElementById('createClubButton');
  if (!btn) return;

  btn.addEventListener('click', () => {
    navigateTo('club_create.html');
  });
}

// TOP 버튼
function setupTopButton() {
  const topButton = document.getElementById('topButton');
  if (!topButton) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      topButton.classList.add('show');
    } else {
      topButton.classList.remove('show');
    }
  });

  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// 클럽 상세 페이지로 이동
function goToDetail(clubId) {
  console.log('클럽 상세 이동:', clubId);
  navigateTo(`club_detail.html?id=${clubId}`);
}

async function initClubsPage() {
  console.log('클럽 목록 페이지 초기화');

  await loadClubs();
  setupFilters();
  setupTopButton();
  setupCreateClubButton();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initClubsPage);
} else {
  initClubsPage();
}

console.log('clubs/list.js 로드 완료');