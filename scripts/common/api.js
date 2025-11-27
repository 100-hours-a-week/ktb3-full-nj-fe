// common/api.js

// API 기본 URL
const API_BASE_URL = 'http://localhost:8080';

// ========== API 요청 래퍼 함수 ==========

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 요청 옵션 설정
  const config = {
    method: options.method || 'GET',
    headers: options.headers || {},
    credentials: 'include',
    ...options
  };
  
  // FormData가 아닐 때만 Content-Type 설정
  if (!options.isFormData && config.body && typeof config.body === 'string') {
    config.headers['Content-Type'] = 'application/json';
  }
  
  // Access Token 추가
  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  console.log(`➡️ API 요청: ${config.method} ${url}`);
  
  try {
    const response = await fetch(url, config);
    
    console.log(`✅ ${config.method} ${url}`, response.status);
    
    // ✅ 401 처리 (refresh 엔드포인트는 제외!)
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
      console.log('⚠️ 401 Unauthorized - 토큰 재발급 시도');
      
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        // 재발급 성공 → 원래 요청 재시도
        console.log('✅ 토큰 재발급 성공 - 요청 재시도');
        config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(url, config);
        
        if (retryResponse.status === 204) {
          return { success: true };
        }
        
        return await retryResponse.json();
      } else {
        // 재발급 실패 → 로그인 페이지로
        console.log('❌ 토큰 재발급 실패 - 로그인 필요');
        handleLogoutRedirect();
        return;
      }
    }
    
    // 204 No Content 처리
    if (response.status === 204) {
      console.log('✅ 응답: 204 No Content');
      return { success: true };
    }
    
    // 응답 바디 파싱
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : { success: true };
    }
    
    console.log('✅ 응답 (' + response.status + '):', data);
    
    // 에러 응답 처리
    if (!response.ok) {
      throw new ApiError(
        data.message || getErrorMessage(response.status),
        response.status,
        data
      );
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ API 요청 실패:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError('네트워크 연결을 확인해주세요', 0, null);
  }
}

// ========== 커스텀 API 에러 클래스 ==========

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// 에러 메시지 매핑
function getErrorMessage(status) {
  const messages = {
    400: '잘못된 요청입니다',
    401: '인증이 필요합니다',
    403: '권한이 없습니다',
    404: '요청한 리소스를 찾을 수 없습니다',
    409: '이미 존재하는 데이터입니다',
    500: '서버 오류가 발생했습니다'
  };
  return messages[status] || '알 수 없는 오류가 발생했습니다';
}

// ========== 토큰 관리 ==========

/**
 * 로그인 성공 시 accessToken만 저장
 * refreshToken은 httpOnly 쿠키로 자동 관리됨
 */
function storeToken(accessToken) {
  localStorage.setItem('accessToken', accessToken);
  console.log('✅ accessToken 저장 완료');
}

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function removeToken() {
  localStorage.removeItem('accessToken');
  console.log('✅ accessToken 삭제 완료 (refreshToken은 서버에서 삭제)');
}

function isLoggedIn() {
  return !!getAccessToken();
}

// ========== 인증 API ==========

/**
 * 로그인
 */
async function login(email, password) {
  console.log('🔑 로그인 API 호출');
  
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  // ✅ accessToken만 저장 (refreshToken은 쿠키로 자동 저장됨)
  if (response.data && response.data.accessToken) {
    storeToken(response.data.accessToken);
  }
  
  return response;
}

/**
 * 회원가입
 */
async function signup(formData) {
  console.log('📝 회원가입 API 호출');
  
  return await apiRequest('/auth/signup', {
    method: 'POST',
    body: formData,
    isFormData: true
  });
}

// ========== 토큰 재발급 (재귀 호출 방지) ==========

let isRefreshing = false;  // ← 재발급 중 플래그

async function refreshAccessToken() {
  // ✅ 이미 재발급 중이면 대기
  if (isRefreshing) {
    console.log('⏳ 이미 토큰 재발급 중...');
    return false;
  }
  
  isRefreshing = true;
  console.log('🔄 토큰 재발급 시도');
  
  try {
    // ✅ fetch 직접 호출 (apiRequest 거치지 않음)
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',  // refreshToken 쿠키 포함
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data.accessToken) {
        storeToken(data.data.accessToken);
        console.log('✅ 토큰 재발급 성공');
        isRefreshing = false;
        return true;
      }
    }
    
    console.error('❌ 토큰 재발급 실패 (응답 오류)');
    isRefreshing = false;
    return false;
    
  } catch (error) {
    console.error('❌ 토큰 재발급 실패 (네트워크 오류):', error);
    isRefreshing = false;
    return false;
  }
}

// ========== 로그아웃 처리 ==========

function handleLogoutRedirect() {
  removeToken();
  
  // ✅ alert 한 번만 표시 (중복 방지)
  if (!sessionStorage.getItem('logoutAlertShown')) {
    sessionStorage.setItem('logoutAlertShown', 'true');
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
  }
  
  // ✅ 로그인 페이지로 이동
  window.location.href = '/login.html';
}

// ========== 로그아웃 ==========

async function logout() {
  console.log('🚪 로그아웃 API 호출');
  
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    removeToken();
    console.log('✅ 로그아웃 성공');
    window.location.href = '/login.html';
    
  } catch (error) {
    console.error('❌ 로그아웃 실패:', error);
    removeToken();
    window.location.href = '/login.html';
  }
}

// ========== 사용자 API ==========

/**
 * 내 정보 조회
 */
async function getMyInfo() {
  console.log('👤 내 정보 조회 API 호출');
  return await apiRequest('/users/me', {
    method: 'GET'
  });
}

// ========== 클럽 API ==========

/**
 * 내가 속한 클럽 목록 조회
 */
async function getMyClubs() {
  console.log('🏠 내 클럽 목록 조회 API 호출');
  
  return await apiRequest('/club-joins/club', {
    method: 'GET'
  });
}

/**
 * 클럽 목록 조회
 */
async function getClubs() {
  console.log('📋 클럽 목록 조회 API 호출');
  return await apiRequest('/clubs', { method: 'GET' });
}

/**
 * 클럽 상세 조회
 */
async function getClub(clubId) {
  console.log('🔍 클럽 상세 조회 API 호출:', clubId);
  return await apiRequest(`/clubs/${clubId}`, { 
    method: 'GET' 
  });
}

/**
 * 클럽 가입 신청
 */
async function applyToClub(clubId) {
  console.log('📝 클럽 가입 신청 API 호출:', clubId);
  
  return await apiRequest(`/clubs/${clubId}/apply`, {
    method: 'POST'
  });
}

/**
 * 클럽 가입 신청 취소
 */
async function cancelApplication(clubId) {
  console.log('❌ 가입 신청 취소 API 호출:', clubId);
  
  return await apiRequest(`/clubs/${clubId}/apply`, {
    method: 'DELETE'
  });
}

/**
 * 클럽 탈퇴
 */
async function leaveClub(clubId) {
  console.log('🚪 클럽 탈퇴 API 호출:', clubId);
  
  return await apiRequest(`/clubs/${clubId}/leave`, {
    method: 'DELETE'
  });
}

/**
 * 내 가입 상태 조회
 */
async function getMyJoinStatus(clubId) {
  console.log('📊 내 가입 상태 조회 API 호출:', clubId);
  
  return await apiRequest(`/clubs/${clubId}/my-status`, {
    method: 'GET'
  });
}

/**
 * 대기 중인 신청 목록 조회 (관리자)
 */
async function getPendingApplications(clubId) {
  console.log('📋 대기 신청 목록 조회 API 호출:', clubId);
  
  return await apiRequest(`/clubs/${clubId}/applications`, {
    method: 'GET'
  });
}

/**
 * 가입 신청 승인 (관리자)
 */
async function approveApplication(clubId, applicantId) {
  console.log('✅ 가입 신청 승인 API 호출:', clubId, applicantId);
  
  return await apiRequest(`/clubs/${clubId}/applications/${applicantId}/approve`, {
    method: 'POST'
  });
}

/**
 * 가입 신청 거절 (관리자)
 */
async function rejectApplication(clubId, applicantId) {
  console.log('❌ 가입 신청 거절 API 호출:', clubId, applicantId);
  
  return await apiRequest(`/clubs/${clubId}/applications/${applicantId}/reject`, {
    method: 'POST'
  });
}

/**
 * 멤버 추방 (관리자)
 */
async function kickMember(clubId, memberId) {
  console.log('🚫 멤버 추방 API 호출:', clubId, memberId);
  
  return await apiRequest(`/clubs/${clubId}/members/${memberId}`, {
    method: 'DELETE'
  });
}

/**
 * 클럽 멤버 목록 조회
 */
async function getClubMembers(clubId) {
  console.log('👥 클럽 멤버 목록 조회 API 호출:', clubId);
  
  return await apiRequest(`/clubs/${clubId}/members`, {
    method: 'GET'
  });
}

// ========== 게시글 API ==========

/**
 * 게시글 목록 조회
 */
async function getPosts(page = 1, limit = 10) {
  console.log('📝 게시글 목록 조회 API 호출', { page, limit }); 
  return await apiRequest('/posts', {
    method: 'GET'
  });
}

/**
 * 게시글 상세 조회
 */
async function getPost(postId) {
  console.log('🔍 게시글 상세 조회 API 호출:', postId);
  return await apiRequest(`/posts/${postId}`, {
    method: 'GET'
  });
}

/**
 * 게시글 수정
 */
async function updatePost(postId, formData) {
  console.log('✏️ 게시글 수정 API 호출:', postId);
  
  return await apiRequest(`/posts/${postId}`, {
    method: 'PATCH',
    body: formData,
    isFormData: true
  });
}

/**
 * 게시글 삭제
 */
async function deletePost(postId) {
  console.log('🗑️ 게시글 삭제 API 호출:', postId);
  
  return await apiRequest(`/posts/${postId}`, {
    method: 'DELETE'
  });
}

console.log('✅ common/api.js 로드 완료');