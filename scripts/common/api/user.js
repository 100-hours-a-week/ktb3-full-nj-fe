import { apiRequest } from './core.js';

// ==========================================
// 사용자 (User) API
// ==========================================

// 내 정보 조회 (마이페이지)
export async function getMyInfo() {
  return await apiRequest('/users/me', { method: 'GET' });
}

// 특정 회원 정보 조회 (상대방 프로필)
export async function getUser(userId) {
  return await apiRequest(`/users/${userId}`, { method: 'GET' });
}

// 내 프로필 수정
export async function updateProfile(formData) {
  return await apiRequest('/users', {
    method: 'PATCH',
    body: formData,
    isFormData: true
  });
}

// 프로필 이미지 삭제 (기본 이미지로 변경)
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