import { apiRequest, storeToken, removeToken} from './core.js';

// ========== 인증 API ==========

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

// 로그아웃
export async function logout() {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST'
    });
  } catch (err) {
    console.warn('서버 로그아웃 실패', err);
  } finally {
    removeToken();
  }
}

console.log('common/api/auth.js 로드 완료');