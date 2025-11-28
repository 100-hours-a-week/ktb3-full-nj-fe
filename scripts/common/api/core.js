// ==================== API 핵심 기능 ====================

// API 기본 URL
export const API_BASE_URL = 'http://localhost:8080';

// ========== 커스텀 API 에러 클래스 ==========

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ========== 에러 메시지 매핑 ==========

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

export function storeToken(accessToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('tokenStoredAt', Date.now());
}

export function getAccessToken() {
  const token = localStorage.getItem('accessToken');
  const storedAt = localStorage.getItem('tokenStoredAt');
  
  // 15분 초과 시 무효화
  if (token && storedAt) {
    const elapsed = Date.now() - parseInt(storedAt);
    const fifteenMinutes = 15 * 60 * 1000;
    
    if (elapsed > fifteenMinutes) {
      console.warn('⚠️ 로컬 토큰 만료');
      removeToken();
      return null;
    }
  }
  
  return token;
}

export function removeToken() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('tokenStoredAt');
}

export function isLoggedIn() {
  return !!getAccessToken();
}

// ========== 토큰 재발급 ==========

let isRefreshing = false;

export async function refreshAccessToken() {
  if (isRefreshing) {
    return false;
  }
  
  isRefreshing = true;
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.data && data.data.accessToken) {
        storeToken(data.data.accessToken);
        isRefreshing = false;
        return true;
      }
    }
    
    isRefreshing = false;
    return false;
    
  } catch (error) {
    console.error('❌ 토큰 재발급 실패:', error);
    isRefreshing = false;
    return false;
  }
}

// ========== 로그아웃 리다이렉트 ==========

export function handleLogoutRedirect() {
  removeToken();
  
  if (!sessionStorage.getItem('logoutAlertShown')) {
    sessionStorage.setItem('logoutAlertShown', 'true');
    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
  }
  
  window.location.href = '/login.html';
}

// ========== API 요청 래퍼 함수 ==========

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
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
  
  try {
    const response = await fetch(url, config);
    
    console.log(`😎 ${config.method} ${url}`, response.status);
    
    // 401 처리
    if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
      console.log('⚠️ 401 Unauthorized - 토큰 재발급 시도');
      
      const refreshed = await refreshAccessToken();
      
      if (refreshed) {
        console.log('토큰 재발급 성공 - 요청 재시도');
        config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(url, config);
        
        if (retryResponse.status === 204) {
          return { success: true };
        }
        
        return await retryResponse.json();
      } else {
        console.log('토큰 재발급 실패 - 로그인 필요');
        handleLogoutRedirect();
        return;
      }
    }
    
    // 204 No Content 처리
    if (response.status === 204) {
      console.log('😎 응답: 204 No Content');
      return { success: true };
    }
    
    // 응답 파싱
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text ? { message: text } : { success: true };
    }
    
    console.log('☺️ 응답 (' + response.status + '):', data);
    
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
    console.error('API 요청 실패:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError('네트워크 연결을 확인해주세요', 0, null);
  }
}

console.log('common/api/core.js 로드 완료');