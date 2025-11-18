// 게시물 목록 메인 로직

//=========상태 관리=========
let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;
let allPosts = [];

//=========상수=========
const POSTS_PER_PAGE = 10;

//=========렌더링=========
// 게시물 카드 HTML 생성
function createPostCardHTML(post) {
  return `
    <article class="post-card" data-id="${post.postId}">
      <h3 class="post-title">${truncateTitle(post.title)}</h3>
      <div class="post-stats">
        <div class="stat-item">
          <span class="stat-text">좋아요 ${formatNumber(post.likes || 0)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-text">댓글 ${formatNumber(post.comments || 0)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-text">조회수 ${formatNumber(post.views || 0)}</span>
        </div>
        <span class="post-date">${formatDate(post.createdAt)}</span>
      </div>
      <div class="post-footer">
        <div class="post-author">
          <span class="author-avatar">👤</span>
          <span class="author-name">${post.authorName || '익명'}</span>
        </div>
      </div>
    </article>
  `;
}
// 게시물 목록 렌더링
function renderPosts(posts) {
  console.log('게시글 렌더링:', posts.length, '개');
  
  const container = document.getElementById('postsContainer');
  
  posts.forEach(post => {
    const cardHTML = createPostCardHTML(post);
    container.insertAdjacentHTML('beforeend', cardHTML);
  });
}
// 빈 게시물 UI 렌더링
function renderEmptyState() {
  const container = document.getElementById('postsContainer');
  container.innerHTML = `
    <div style="text-align: center; padding: 80px 20px; color: #999;">
      <p style="font-size: 18px; margin-bottom: 20px;">아직 게시글이 없습니다</p>
      <p>첫 번째 게시글을 작성해보세요!</p>
    </div>
  `;
}
// 에러 UI 렌더링
function renderErrorState() {
  const container = document.getElementById('postsContainer');
  container.innerHTML = `
    <div style="text-align: center; padding: 80px 20px; color: #999;">
      <p style="font-size: 18px; margin-bottom: 20px;">게시글을 불러오는데 실패했습니다</p>
      <button onclick="location.reload()" style="padding: 10px 20px; background: #7F6AEE; color: white; border: none; border-radius: 8px; cursor: pointer;">
        다시 시도
      </button>
    </div>
  `;
}
// 추가 게시물 없는 상태의 UI 렌더링
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

//=========이벤트 핸들러=========
// 게시글 작성 버튼 클릭 이벤트
function setupWriteButtonEvent() {
  const writeBtn = document.querySelector('.btn-write');
  if (!writeBtn) return;
  
  writeBtn.addEventListener('click', function() {
    navigateTo('post_create.html');
  });
}
// 게시글 카드 클릭 이벤트
function setupCardClickEvents() {
  const container = document.getElementById('postsContainer');
  
  // 이미 이벤트가 등록되어 있으면 중복 방지
  if (container.dataset.eventAttached) return;
  
  container.addEventListener('click', function(e) {
    const card = e.target.closest('.post-card');
    if (card) {
      const postId = card.dataset.id;
      console.log('게시글 클릭:', postId);
      navigateTo(`post_detail.html?id=${postId}`);
    }
  });
  
  container.dataset.eventAttached = 'true';
}
// 무한 스크롤 이벤트
function setupInfinityScroll() {
  window.addEventListener('scroll', function() {
    if (isLoading || !hasMorePosts) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // 하단 100px 남았을 때 다음 페이지 로드
    if (scrollTop + windowHeight >= documentHeight - 100) {
      loadMorePosts();
    }
  });
}
// 초기 게시글 로드
function loadMorePosts() {
  if (isLoading || !hasMorePosts) return;
  
  isLoading = true;
  showLoading();
  
  console.log(`페이지 ${currentPage + 1} 로드 중`);
  
  // 페이지당 개수씩 표시
  const startIndex = currentPage * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  
  // 다음 페이지 데이터가 있는지 확인
  if (startIndex >= allPosts.length) {
    console.log('더 이상 게시글이 없습니다');
    hasMorePosts = false;
    hideLoading();
    isLoading = false;
    renderEndMessage();
    return;
  }
  
  // 다음 페이지 데이터 가져오기
  setTimeout(() => {
    const nextPagePosts = allPosts.slice(startIndex, endIndex);
    
    currentPage++;
    hideLoading();
    renderPosts(nextPagePosts);
    isLoading = false;
    
    console.log(`페이지 ${currentPage} 로드 완료 (${nextPagePosts.length}개)`);
  }, 500);
}

//=========데이터 로드=========
async function loadInitialPosts() {
  console.log('초기 게시글 로드 중...');
  
  const container = document.getElementById('postsContainer');
  container.innerHTML = '';
  
  showLoading();
  
  try {
    const response = await getPosts();
    allPosts = response.data || [];
    
    console.log('게시글 로드 완료:', allPosts.length, '개');
    
    // 게시글이 없으면
    if (allPosts.length === 0) {
      hideLoading();
      renderEmptyState();
      hasMorePosts = false;
      return;
    }
    
    // 최신순 정렬
    allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 첫 페이지 데이터
    const firstPagePosts = allPosts.slice(0, POSTS_PER_PAGE);
    
    hideLoading();
    renderPosts(firstPagePosts);
    
    // 10개 이하면 더 이상 로드할 게시글 없음
    if (allPosts.length <= POSTS_PER_PAGE) {
      hasMorePosts = false;
    }
    
    console.log(`초기 로드 완료 (전체: ${allPosts.length}개, 표시: ${firstPagePosts.length}개)`);
    
  } catch (error) {
    console.error('게시글 로드 실패:', error);
    
    hideLoading();
    
    if (error.status === 401) {
      showToast('로그인이 필요합니다');
      setTimeout(() => navigateTo('login.html'), 1500);
    } else {
      renderErrorState();
    }
  }
}

//=========초기화=========
async function init() {
  console.log('게시글 목록 페이지 초기화 중');
  
  // 이벤트 설정
  setupWriteButtonEvent();
  setupCardClickEvents();
  setupInfinityScroll();
  
  // 데이터 로드
  await loadInitialPosts();
  
  console.log('✅ 게시글 목록 페이지 로딩 완료!');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('posts/list.js 로드 완료');