import { apiRequest, storeToken, removeToken } from './core.js';

// ==========================================
// 인증 (Auth) API
// ==========================================

// 로그인
export async function login(email, password) {  
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (response.data && response.data.accessToken) {
    storeToken(response.data.accessToken);
  }
  
  return response;
}

// 회원가입
export async function signup(formData) {  
  return await apiRequest('/auth/signup', {
    method: 'POST',
    body: formData,
    isFormData: true
  });
}

// 토큰 재발급 (Refresh)
export async function refreshToken() {
  try {
    const response = await apiRequest('/auth/refresh', {
      method: 'POST'
    });

    if (response.data && response.data.accessToken) {
      storeToken(response.data.accessToken);
    }
    return response;

  } catch (err) {
    console.warn('토큰 재발급 실패: 다시 로그인 필요');
    removeToken();
    throw err;
  }
}

// 로그아웃
export async function logout() {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST'
    });
  } catch (err) {
    console.warn('서버 로그아웃 요청 실패 (이미 만료됨 등)', err);
  } finally {
    removeToken();
  }
}

console.log('common/api/auth.js 로드 완료');