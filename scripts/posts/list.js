// scripts/posts/list.js

// ========= 상수 =========
const DEFAULT_POST_IMAGE = '📄';
const DEFAULT_EVENT_IMAGE = '🎉';

// ========= 상태 변수 =========
let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;
let allPosts = [];
let displayedPosts = [];
let myClubs = []; // 사용자의 동아리 목록
let currentClubFilter = 'all'; // 'all' 또는 clubId (문자열)
let currentTypeFilter = 'all'; // 'all' | 'post' | 'event'
let currentSort = 'latest';
const POSTS_PER_PAGE = 10;

// ========= 더미 제거: 실제 API 사용 권장 =========
// (임시로 API 실패시에만 dummy 사용 - 원하면 제거 가능)
const dummyPosts = []; // 빈 배열로 둠 (원하면 데이터 추가)

// ========= 유틸: 날짜 포맷 (format.js의 formatDate 사용 가능하면 그것 쓰세요) =========
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString();
  } catch (e) {
    return dateStr || '';
  }
}

// ========= 이미지 URL 헬퍼 =========
function getImageUrl(imageData) {
  if (!imageData) return null;
  
  // 이미지 객체에서 URL 추출
  let imagePath = imageData.url || imageData.imageUrl || imageData;
  
  // 이미 절대 URL이면 그대로 반환
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // 백엔드 경로 조합 (header.js와 동일한 방식)
  return `${API_BASE_URL}${imagePath}`;
}

// ========= 렌더링 =========
// ========= 렌더링 =========
function createPostCardHTML(post) {
  // 타입 뱃지
  const isEvent = post.eventId || post.type === 'event';
  const typeBadge = isEvent
    ? `<div class="post-type-badge event">행사</div>`
    : '';

  // ✅ 이미지 처리 (header.js 방식과 동일)
  let imageHTML = '';
  if (post.images && post.images.length > 0) {
    const imageUrl = getImageUrl(post.images[0]);
    // 이미지 로드 실패 시 기본 아이콘으로 대체
    const fallbackIcon = isEvent ? DEFAULT_EVENT_IMAGE : DEFAULT_POST_IMAGE;
    imageHTML = `<img src="${imageUrl}" alt="${escapeHtml(post.title)}" onerror="this.parentElement.innerHTML='<div class=\\'post-image-placeholder\\'>${fallbackIcon}</div>'">`;
  } else {
    const defaultIcon = isEvent ? DEFAULT_EVENT_IMAGE : DEFAULT_POST_IMAGE;
    imageHTML = `<div class="post-image-placeholder">${defaultIcon}</div>`;
  }

  // ✅ 작성자 프로필 이미지 (header.js 방식)
  const authorName = post.author?.username || post.authorName || '익명';
  let authorAvatarHTML = '👤';
  
  if (post.author?.profileImage) {
    const profileUrl = `${API_BASE_URL}${post.author.profileImage}`;
    authorAvatarHTML = `<img src="${profileUrl}" alt="${escapeHtml(authorName)}" class="author-avatar-img" onerror="this.outerHTML='👤'">`;
  }

  // 좋아요 상태
  const isLiked = post.isLiked || false;
  const likeClass = isLiked ? 'liked' : '';
  const likeIcon = isLiked ? '❤️' : '🤍';

  // 날짜 포맷
  const dateStr = formatRelativeTime(post.createdAt);

  return `
    <div class="post-card" data-id="${post.postId || post.id}" data-event-id="${post.eventId || ''}">
      ${typeBadge}
      <div class="post-image">${imageHTML}</div>
      <div class="post-divider"></div>
      <div class="post-content">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-excerpt">${escapeHtml(post.content || '')}</p>
        <div class="post-meta">
          <div class="post-author">
            <span class="author-avatar">${authorAvatarHTML}</span>
            <span>${escapeHtml(authorName)}</span>
          </div>
          <div class="post-stats">
            <button class="stat-item like-btn ${likeClass}" data-post-id="${post.postId || post.id}">
              <span class="like-icon">${likeIcon}</span>
              <span class="like-count">${post.likeCount || post.likes || 0}</span>
            </button>
            <span class="stat-item right">💬 ${post.commentCount || post.comments || 0}</span>
            <span class="stat-item right">👁️ ${post.viewCount || post.views || 0}</span>
          </div>
          <span class="post-date">${dateStr}</span>
        </div>
      </div>
      <div class="post-arrow">
        <span class="post-arrow-icon">→</span>
      </div>
    </div>
  `;
}

// ========= 날짜 포맷 =========
function formatRelativeTime(dateStr) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    // 7일 이상이면 날짜 표시
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (e) {
    return dateStr || '';
  }
}

// ========= 좋아요 기능 =========
async function toggleLike(postId) {
  try {
    // API 호출 (토글 방식)
    const response = await apiRequest(`/posts/${postId}/like`, {
      method: 'POST'
    });
    
    console.log('좋아요 토글 성공:', response);
    
    // UI 업데이트
    const likeBtn = document.querySelector(`.like-btn[data-post-id="${postId}"]`);
    if (!likeBtn) return;
    
    const isLiked = response.data.isLiked;
    const likeCount = response.data.likeCount;
    
    // 아이콘 변경
    const icon = likeBtn.querySelector('.like-icon');
    icon.textContent = isLiked ? '❤️' : '🤍';
    
    // 개수 변경
    const count = likeBtn.querySelector('.like-count');
    count.textContent = likeCount;
    
    // 클래스 토글
    if (isLiked) {
      likeBtn.classList.add('liked');
    } else {
      likeBtn.classList.remove('liked');
    }
    
  } catch (error) {
    console.error('좋아요 실패:', error);
    
    if (error.status === 401) {
      showToast('로그인이 필요합니다', 2000, 'error');
    } else {
      showToast('좋아요 처리 중 오류가 발생했습니다', 2000, 'error');
    }
  }
}

function renderPosts(posts, replace = false) {
  const container = document.getElementById('postsContainer');
  if (replace) container.innerHTML = '';

  if (!posts || posts.length === 0) {
    if (replace) renderEmptyState();
    return;
  }

  posts.forEach(p => {
    container.insertAdjacentHTML('beforeend', createPostCardHTML(p));
  });

  setupCardClickEvents(); // 카드 클릭 이벤트 바인딩 보장
}

function renderEmptyState() {
  const container = document.getElementById('postsContainer');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📝</div>
      <div class="empty-state-text">아직 게시글이 없습니다</div>
    </div>
  `;
}

function renderEndMessage() {
  const container = document.getElementById('postsContainer');
  const endMessage = document.createElement('div');
  endMessage.className = 'end-message';
  endMessage.style.textAlign = 'center';
  endMessage.style.padding = '40px';
  endMessage.style.color = '#999';
  endMessage.textContent = '모든 게시글을 불러왔습니다';
  container.appendChild(endMessage);
}

// ========= 보안 유틸 (간단 escape) =========
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

// ========= 필터/정렬 로직 =========
function applyFiltersAndSortAndRender(replace = true) {
  console.log('필터/정렬 적용:', { currentClubFilter, currentTypeFilter, currentSort });

  let filtered = [...allPosts];

  // 클럽 필터: 만약 currentClubFilter !== 'all', 필터링 조건은 post.clubId === currentClubFilter
  if (currentClubFilter && currentClubFilter !== 'all') {
    filtered = filtered.filter(p => String(p.clubId) === String(currentClubFilter));
  }

  // 타입 필터: 'post' => 일반/공지? here we assume posts have type 'event' for 행사, otherwise 'general'/'notice' => treat as post
  if (currentTypeFilter && currentTypeFilter !== 'all') {
    if (currentTypeFilter === 'event') {
      filtered = filtered.filter(p => p.type === 'event');
    } else if (currentTypeFilter === 'post') {
      filtered = filtered.filter(p => p.type !== 'event');
    }
  }

  // 정렬
  if (currentSort === 'latest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (currentSort === 'popular') {
    filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (currentSort === 'views') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  // pagination 초기화
  currentPage = 1;
  hasMorePosts = filtered.length > POSTS_PER_PAGE;

  displayedPosts = filtered.slice(0, POSTS_PER_PAGE);

  // 렌더
  const container = document.getElementById('postsContainer');
  container.innerHTML = '';
  if (displayedPosts.length === 0) {
    renderEmptyState();
    return;
  }
  renderPosts(displayedPosts, true);
}

// ========= 이벤트 바인딩 =========
function setupFilterTabs() {
  document.querySelectorAll('.type-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.type-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentTypeFilter = tab.dataset.filter || 'all';
      applyFiltersAndSortAndRender();
    });
  });
}

function setupSortButtons() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentSort = btn.dataset.sort || 'latest';
      applyFiltersAndSortAndRender();
    });
  });
}

// 카드 클릭 이벤트 (delegate)
function setupCardClickEvents() {
  const container = document.getElementById('postsContainer');
  if (!container) return;
  if (container.dataset.attach === 'true') return;

  container.addEventListener('click', function(e) {
    // 좋아요 버튼 클릭
    const likeBtn = e.target.closest('.like-btn');
    if (likeBtn) {
      e.stopPropagation(); // 카드 클릭 이벤트 방지
      const postId = likeBtn.dataset.postId;
      toggleLike(postId);
      return;
    }
    
    // 카드 클릭 (상세 페이지 이동)
    const card = e.target.closest('.post-card');
    if (card) {
      const postId = card.dataset.id;
      const eventId = card.dataset.eventId;
      
      // 행사면 event_detail.html, 아니면 post_detail.html
      if (eventId) {
        navigateTo(`event_detail.html?id=${eventId}`);
      } else {
        navigateTo(`post_detail.html?id=${postId}`);
      }
    }
  });

  container.dataset.attach = 'true';
}

// 무한 스크롤
function setupInfinityScroll() {
  window.addEventListener('scroll', function() {
    if (isLoading || !hasMorePosts) return;
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight - 120) {
      loadMorePosts();
    }
  });
}

function loadMorePosts() {
  if (isLoading || !hasMorePosts) return;

  isLoading = true;
  showLoading();

  const start = currentPage * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;

  setTimeout(() => {
    // 필터&정렬을 이미 반영한 전체 목록에서 페이지네이션
    let source = [...allPosts];

    // apply same filtering as in applyFiltersAndSortAndRender but without re-render reset
    if (currentClubFilter && currentClubFilter !== 'all') {
      source = source.filter(p => String(p.clubId) === String(currentClubFilter));
    }
    if (currentTypeFilter && currentTypeFilter !== 'all') {
      if (currentTypeFilter === 'event') source = source.filter(p => p.type === 'event');
      else source = source.filter(p => p.type !== 'event');
    }

    if (currentSort === 'latest') {
      source.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSort === 'popular') {
      source.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (currentSort === 'views') {
      source.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    const next = source.slice(start, end);
    if (next.length === 0) {
      hasMorePosts = false;
      renderEndMessage();
      hideLoading();
      isLoading = false;
      return;
    }

    renderPosts(next);
    currentPage++;
    hideLoading();
    isLoading = false;
  }, 400);
}

// ========= API 로드 함수 (getPosts, getMyClubs 은 scripts/common/api.js 에 구현되어 있어야 함) =========
async function loadInitialData() {
  showLoading();

  try {
    const postsResp = await getPosts(); // api.js 에 존재
    allPosts = postsResp.data || [];

    // fallback
    if (!allPosts || allPosts.length === 0) {
      allPosts = dummyPosts.slice();
    }
  } catch (err) {
    console.error('게시글 로드 실패, fallback 사용', err);
    allPosts = dummyPosts.slice();
  }

  try {
    await loadMyClubs(); // 동아리 로드 -> custom select 초기화 포함
  } catch (err) {
    console.warn('동아리 로드 실패:', err);
  }

  hideLoading();

  // 초기 렌더 (필터/정렬 반영)
  applyFiltersAndSortAndRender(true);
}

// 동아리 목록 로드 및 custom-select에 렌더링
async function loadMyClubs() {
  const wrapper = document.querySelector('.custom-select[data-target="clubFilter"]');
  const hiddenSelect = document.getElementById('clubFilter');

  // 안전 체크: 없으면 hidden select 동적 생성
  if (!hiddenSelect) {
    const sel = document.createElement('select');
    sel.id = 'clubFilter';
    sel.style.display = 'none';
    document.body.appendChild(sel);
  }

  const hidden = document.getElementById('clubFilter');
  const menu = wrapper ? wrapper.querySelector('.custom-select-menu') : null;

  // 초기 placeholder
  if (hidden) hidden.innerHTML = `<option value="all">전체</option>`;
  if (menu) menu.innerHTML = `<div class="custom-select-option" data-value="all">전체</div>`;

  try {
    const resp = await getMyClubs();
    myClubs = resp.data || [];

    console.log('🔹 동아리 목록 로드됨:', myClubs); // 디버깅

    if (!myClubs || myClubs.length === 0) {
      if (hidden) {
        hidden.innerHTML = `<option value="all">전체</option>`;
      }
      if (menu) {
        menu.innerHTML = `<div class="custom-select-option" data-value="all">전체</div>`;
      }
    } else {
      hidden.innerHTML = `<option value="all">전체</option>`;
      if (menu) menu.innerHTML = `<div class="custom-select-option" data-value="all">전체</div>`;

      myClubs.forEach((c) => {
        const id = c.clubId ?? c.id;
        const name = c.clubName || c.name || c.title || `클럽 ${id}`;

        // hidden select
        const opt = document.createElement('option');
        opt.value = String(id);
        opt.textContent = name;
        hidden.appendChild(opt);

        // custom menu
        if (menu) {
          const div = document.createElement('div');
          div.className = 'custom-select-option';
          div.dataset.value = String(id);
          div.textContent = name;
          menu.appendChild(div);
        }
      });
    }

    // 커스텀 셀렉트 재초기화
    if (window.initCustomSelects) {
      console.log('🔹 커스텀 셀렉트 초기화 중...');
      window.initCustomSelects();
    }

    // 중요: 이벤트 핸들러 등록
    console.log('🔹 동아리 필터 이벤트 핸들러 등록 중...');
    setupClubCustomSelectBehavior();

  } catch (err) {
    console.error('❌ getMyClubs 실패', err);
    if (window.initCustomSelects) window.initCustomSelects();
    setupClubCustomSelectBehavior(); // 에러 시에도 등록
  }
}

function setupClubCustomSelectBehavior() {
  const hidden = document.getElementById('clubFilter');
  if (!hidden) {
    console.warn('⚠️ clubFilter hidden select를 찾을 수 없음');
    return;
  }
  
  // ❌ DOM 교체 하지 마! custom_select.js 연결 끊어짐
  // const newHidden = hidden.cloneNode(true);
  // hidden.parentNode.replaceChild(newHidden, hidden);
  
  // ✅ 기존 리스너 제거 (만약 있다면)
  hidden.removeEventListener('change', handleClubChange);
  
  // ✅ 새 리스너 추가
  hidden.addEventListener('change', handleClubChange);
  
  console.log('✅ 동아리 필터 이벤트 핸들러 등록 완료');
}

// 핸들러를 별도 함수로 분리 (removeEventListener를 위해)
function handleClubChange(e) {
  const newValue = e.target.value || 'all';
  console.log('🔹 동아리 필터 변경:', newValue);
  currentClubFilter = newValue;
  
  updateHeroMessage();
  applyFiltersAndSortAndRender();
}

function updateHeroMessage() {
  const subtitle = document.getElementById('heroSubtitle');
  if (!subtitle) {
    console.warn('❌ heroSubtitle 요소를 찾을 수 없음');
    return;
  }
  
  const clubName = getSelectedClubName();
  console.log('🔹 히어로 메시지 업데이트:', clubName); // ← 추가
  
  subtitle.innerHTML = `${clubName} <span class="highlight">게시판</span>입니다.`;
}

function getSelectedClubName() {
  const clubFilter = document.getElementById('clubFilter');
  console.log('🔹 현재 선택된 값:', clubFilter?.value); // ← 추가
  console.log('🔹 myClubs:', myClubs); // ← 추가
  
  if (!clubFilter || clubFilter.value === 'all') {
    return 'C.Groove';
  }
  
  const selectedClub = myClubs.find(c => {
    console.log('🔹 비교:', String(c.clubId), '===', String(clubFilter.value)); // ← 추가
    return String(c.clubId) === String(clubFilter.value);
  });
  
  console.log('🔹 찾은 동아리:', selectedClub); // ← 추가
  return selectedClub ? (selectedClub.clubName || selectedClub.name) : 'C.Groove';
}

// 필터 적용 함수 수정
function applyFiltersAndSortAndRender(replace = true) {
  console.log('필터/정렬 적용:', { currentClubFilter, currentTypeFilter, currentSort });
  
  updateHeroMessage(); // ← 추가
  
  let filtered = [...allPosts];

  if (currentClubFilter && currentClubFilter !== 'all') {
    filtered = filtered.filter(p => String(p.clubId) === String(currentClubFilter));
  }

  if (currentTypeFilter && currentTypeFilter !== 'all') {
    if (currentTypeFilter === 'event') {
      filtered = filtered.filter(p => p.type === 'event');
    } else if (currentTypeFilter === 'post') {
      filtered = filtered.filter(p => p.type !== 'event');
    }
  }

  if (currentSort === 'latest') {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (currentSort === 'popular') {
    filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else if (currentSort === 'views') {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  currentPage = 1;
  hasMorePosts = filtered.length > POSTS_PER_PAGE;
  displayedPosts = filtered.slice(0, POSTS_PER_PAGE);

  const container = document.getElementById('postsContainer');
  container.innerHTML = '';
  if (displayedPosts.length === 0) {
    renderEmptyState();
    return;
  }
  renderPosts(displayedPosts, true);
}

// ========= 초기화 =========
async function init() {
  console.log('게시글 목록 초기화');

  setupFilterTabs();
  setupSortButtons();
  setupInfinityScroll();
  setupCardClickEvents();

  // ❌ 여기서 initCustomSelects 호출하지 마!
  // if (window.initCustomSelects) window.initCustomSelects();

  await loadInitialData(); // ← 이 안에서 loadMyClubs()가 initCustomSelects() 호출함

  console.log('초기화 완료');
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
