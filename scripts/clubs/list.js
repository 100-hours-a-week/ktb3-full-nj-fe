// scripts/clubs/list.js

// ============================================
// 상수 & 전역 상태
// ============================================

let currentFilter = 'all';       // all / club / crew / my
let currentSort = 'name';        // name / name-desc / members
let clubs = [];                  // ClubResponse + isMine
let myClubIds = new Set();       // 내가 가입한 모든 클럽 ID들

// ============================================
// 초기화
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('동아리 페이지 초기화');
  initClubsPage();
});

async function initClubsPage() {
  await loadClubs();         // 전체 + 내 클럽 동시 로드
  setupFilters();            // 필터/정렬 버튼 이벤트
  setupTopButton();          // TOP 버튼
  setupCreateClubButton();   // 동아리 생성 버튼(있다면)
}

// ============================================
// 동아리 로드 (API)
// ============================================

async function loadClubs() {
  console.log('동아리 데이터 로드 (API 호출)');
  const grid = document.getElementById('clubsGrid');
  if (!grid) {
    console.warn('#clubsGrid 요소를 찾을 수 없습니다.');
    return;
  }

  grid.innerHTML = '';

  try {
    const [allRes, myRes] = await Promise.allSettled([
      getClubs(),        // GET /clubs
      getMyClubs(),    // GET /club-joins/club  (새로 만들 함수)
    ]);

    let apiClubs = [];

    if (allRes.status === 'fulfilled') {
      apiClubs = allRes.value.data || [];
    } else {
      console.warn('전체 클럽 조회 실패:', allRes.reason);
    }

    // 내가 가입한 클럽 목록 → id 집합 만들기
    if (myRes.status === 'fulfilled' && myRes.value.data) {
      const joins = myRes.value.data; // List<ClubJoinResponse>
      myClubIds = new Set(
        joins
          .filter(j => j.status === 'ACTIVE') // 활동중만 내 클럽으로
          .map(j => j.clubId)
      );
    } else {
      console.warn('내 클럽 조회 실패 또는 없음:', myRes.reason);
      myClubIds = new Set();
    }

    // clubs 배열 구성 (백과 필드 통일)
    clubs = (apiClubs || []).map(c => ({
      ...c,
      isMine: myClubIds.has(c.clubId)   // 🔥 여기서 내 클럽 여부 표시
    }));

    applySort();   // 정렬 → 필터 → 렌더링

  } catch (error) {
    console.error('동아리 로드 실패:', error);
    renderClubs([]); // 실패 시 일단 비움
  }
}


// ============================================
// 렌더링
// ============================================

function renderClubs(list = clubs) {
  const grid = document.getElementById('clubsGrid');
  if (!grid) return;

  if (!list || list.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎭</div>
        <div class="empty-state-text">등록된 동아리가 없습니다</div>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map((club) => {
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
                .map((tag) => `<span class="club-tag">${tag}</span>`)
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


// ============================================
// 필터 & 정렬 (기존 로직에서 필드명만 clubName/memberCount로)
// ============================================

function setupFilters() {
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      currentFilter = tab.dataset.filter; // all / club / crew / my
      applyFilters();
    });
  });

  document.querySelectorAll('.sort-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      currentSort = btn.dataset.sort; // name / name-desc / members
      applySort();
    });
  });
}


// 현재 clubs에 정렬 적용 후, 필터까지 적용
function applySort() {
  console.log('정렬 적용:', currentSort);

  if (!clubs || clubs.length === 0) {
    renderClubs([]);
    return;
  }

  const myClubList = clubs.filter(c => c.isMine);
  const otherClubs = clubs.filter(c => !c.isMine);

  if (currentSort === 'name') {
    otherClubs.sort((a, b) => a.clubName.localeCompare(b.clubName, 'ko'));
  } else if (currentSort === 'name-desc') {
    otherClubs.sort((a, b) => b.clubName.localeCompare(a.clubName, 'ko'));
  } else if (currentSort === 'members') {
    otherClubs.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));
  }

  clubs = [...myClubList, ...otherClubs];

  applyFilters(); // 정렬 후 필터 적용
}


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


// ============================================
// 상세 페이지 / 생성 페이지 이동
// ============================================

function goToDetail(clubId) {
  console.log('동아리 상세 페이지 이동:', clubId);
  navigateTo(`club_detail.html?id=${clubId}`);
}

function setupCreateClubButton() {
  const btn = document.getElementById('createClubButton');
  if (!btn) return;

  btn.addEventListener('click', () => {
    navigateTo('club_create.html');
  });
}

// ============================================
// TOP 버튼
// ============================================

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

console.log('clubs/list.js 로드 완료');
