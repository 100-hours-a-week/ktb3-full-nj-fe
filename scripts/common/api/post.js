import { apiRequest } from './core.js';

// ========== 게시글 API ==========

export async function getPosts(page = 1, limit = 10) {
  console.log('📝 게시글 목록 조회 API 호출', { page, limit });
  return await apiRequest('/posts', { method: 'GET' });
}

export async function getPost(postId) {
  console.log('🔍 게시글 상세 조회 API 호출:', postId);
  return await apiRequest(`/posts/${postId}`, { method: 'GET' });
}

export async function createPost(formData) {
  console.log('✏️ 게시글 생성 API 호출');
  return await apiRequest('/posts', {
    method: 'POST',
    body: formData,
    isFormData: true
  });
}

export async function updatePost(postId, formData) {
  console.log('✏️ 게시글 수정 API 호출:', postId);
  return await apiRequest(`/posts/${postId}`, {
    method: 'PATCH',
    body: formData,
    isFormData: true
  });
}

export async function deletePost(postId) {
  console.log('🗑️ 게시글 삭제 API 호출:', postId);
  return await apiRequest(`/posts/${postId}`, { method: 'DELETE' });
}

console.log('common/api/post.js 로드 완료');