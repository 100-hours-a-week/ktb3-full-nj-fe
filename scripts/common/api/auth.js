import { apiRequest, storeToken, removeToken, API_BASE_URL } from './core.js';

// ========== 인증 API ==========

/**
 * 로그인
 */
export async function login(email, password) {
  console.log('🔑 로그인 API 호출');
  
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (response.data && response.data.accessToken) {
    storeToken(response.data.accessToken);
  }
  
  return response;
}

/**
 * 회원가입
 */
export async function signup(formData) {
  console.log('📝 회원가입 API 호출');
  
  return await apiRequest('/auth/signup', {
    method: 'POST',
    body: formData,
    isFormData: true
  });
}

/**
 * 로그아웃
 */
export async function logout() {
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

console.log('common/api/auth.js 로드 완료');