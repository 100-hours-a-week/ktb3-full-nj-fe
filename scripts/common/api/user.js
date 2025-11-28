import { apiRequest } from './core.js';

// ========== 사용자 API ==========

// 내 정보 조회
export async function getMyInfo() {
  return await apiRequest('/users/me', { method: 'GET' });
}

// 프로필 수정
export async function updateProfile(formData) {
  return await apiRequest('/users', {
    method: 'PATCH',
    body: formData,
    isFormData: true
  });
}

// 프로필 이미지 삭제
export async function deleteProfileImage() {
  return await apiRequest('/users/profile-image', {
    method: 'DELETE'
  });
}

// 비밀번호 변경
export async function updatePassword(password) {
  return await apiRequest('/users/password', {
    method: 'PATCH',
    body: JSON.stringify({ password })
  });
}

// 회원 탈퇴
export async function deleteAccount() {
  return await apiRequest('/users', {
    method: 'DELETE'
  });
}

console.log('common/api/user.js 로드 완료');