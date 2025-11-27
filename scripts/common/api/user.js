import { apiRequest } from './core.js';

// ========== 사용자 API ==========

/**
 * 내 정보 조회
 */
export async function getMyInfo() {
  console.log('👤 내 정보 조회 API 호출');
  return await apiRequest('/users/me', { method: 'GET' });
}

/**
 * 프로필 수정
 */
export async function updateProfile(formData) {
  console.log('✏️ 프로필 수정 API 호출');
  
  return await apiRequest('/users', {
    method: 'PATCH',
    body: formData,
    isFormData: true
  });
}

/**
 * 프로필 이미지 삭제
 */
export async function deleteProfileImage() {
  console.log('🗑️ 프로필 이미지 삭제 API 호출');
  
  return await apiRequest('/users/profile-image', {
    method: 'DELETE'
  });
}

/**
 * 비밀번호 변경
 */
export async function updatePassword(password) {
  console.log('🔒 비밀번호 변경 API 호출');
  
  return await apiRequest('/users/password', {
    method: 'PATCH',
    body: JSON.stringify({ password })
  });
}

/**
 * 회원 탈퇴
 */
export async function deleteAccount() {
  console.log('❌ 회원 탈퇴 API 호출');
  
  return await apiRequest('/users', {
    method: 'DELETE'
  });
}

console.log('common/api/user.js 로드 완료');