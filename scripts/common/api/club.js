import { apiRequest } from './core.js';

// ========== 클럽 API ==========

export async function getMyClubs() {
  console.log('🏠 내 클럽 목록 조회 API 호출');
  return await apiRequest('/club-joins/club', { method: 'GET' });
}

export async function getClubs() {
  console.log('📋 클럽 목록 조회 API 호출');
  return await apiRequest('/clubs', { method: 'GET' });
}

export async function getClub(clubId) {
  console.log('🔍 클럽 상세 조회 API 호출:', clubId);
  return await apiRequest(`/clubs/${clubId}`, { method: 'GET' });
}

export async function applyToClub(clubId) {
  console.log('📝 클럽 가입 신청 API 호출:', clubId);
  return await apiRequest(`/clubs/${clubId}/apply`, { method: 'POST' });
}

export async function cancelApplication(clubId) {
  console.log('❌ 가입 신청 취소 API 호출:', clubId);
  return await apiRequest(`/clubs/${clubId}/apply`, { method: 'DELETE' });
}

export async function leaveClub(clubId) {
  console.log('🚪 클럽 탈퇴 API 호출:', clubId);
  return await apiRequest(`/clubs/${clubId}/leave`, { method: 'DELETE' });
}

export async function getMyJoinStatus(clubId) {
  console.log('📊 내 가입 상태 조회 API 호출:', clubId);
  return await apiRequest(`/clubs/${clubId}/my-status`, { method: 'GET' });
}

export async function getPendingApplications(clubId) {
  console.log('📋 대기 신청 목록 조회 API 호출:', clubId);
  return await apiRequest(`/clubs/${clubId}/applications`, { method: 'GET' });
}

export async function approveApplication(clubId, applicantId) {
  console.log('✅ 가입 신청 승인 API 호출:', clubId, applicantId);
  return await apiRequest(`/clubs/${clubId}/applications/${applicantId}/approve`, { method: 'POST' });
}

export async function rejectApplication(clubId, applicantId) {
  console.log('❌ 가입 신청 거절 API 호출:', clubId, applicantId);
  return await apiRequest(`/clubs/${clubId}/applications/${applicantId}/reject`, { method: 'POST' });
}

export async function kickMember(clubId, memberId) {
  console.log('🚫 멤버 추방 API 호출:', clubId, memberId);
  return await apiRequest(`/clubs/${clubId}/members/${memberId}`, { method: 'DELETE' });
}

export async function getClubMembers(clubId) {
  console.log('👥 클럽 멤버 목록 조회 API 호출:', clubId);
  return await apiRequest(`/clubs/${clubId}/members`, { method: 'GET' });
}

console.log('common/api/club.js 로드 완료');