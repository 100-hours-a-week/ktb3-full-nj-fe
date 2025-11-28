import { apiRequest } from './core.js';

// ========== 클럽 API ==========
// 회원가입
export async function createClub(formData) {  
  return await apiRequest('/clubs', {
    method: 'POST',
    body: formData,
    isFormData: true
  });
}

export async function getMyClubs() {
  return await apiRequest('/clubs/my', { method: 'GET' });
}

export async function getClubs() {
  return await apiRequest('/clubs', { method: 'GET' });
}

export async function getClub(clubId) {
  return await apiRequest(`/clubs/${clubId}`, { method: 'GET' });
}

export async function applyToClub(clubId) {
  return await apiRequest(`/clubs/${clubId}/apply`, { method: 'POST' });
}

export async function cancelApplication(clubId) {
  return await apiRequest(`/clubs/${clubId}/apply`, { method: 'DELETE' });
}

export async function leaveClub(clubId) {
  return await apiRequest(`/clubs/${clubId}/leave`, { method: 'DELETE' });
}

export async function getMyJoinStatus(clubId) {
  return await apiRequest(`/clubs/${clubId}/my-status`, { method: 'GET' });
}

export async function getPendingApplications(clubId) {
  return await apiRequest(`/clubs/${clubId}/applications`, { method: 'GET' });
}

export async function approveApplication(clubId, applicantId) {
  return await apiRequest(`/clubs/${clubId}/applications/${applicantId}/approve`, { method: 'POST' });
}

export async function rejectApplication(clubId, applicantId) {
  return await apiRequest(`/clubs/${clubId}/applications/${applicantId}/reject`, { method: 'POST' });
}

export async function kickMember(clubId, memberId) {
  return await apiRequest(`/clubs/${clubId}/members/${memberId}`, { method: 'DELETE' });
}

export async function getClubMembers(clubId) {
  return await apiRequest(`/clubs/${clubId}/members`, { method: 'GET' });
}

console.log('common/api/club.js 로드 완료');