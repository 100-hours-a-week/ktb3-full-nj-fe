import { apiRequest } from './core.js';

// ========== 게시글 API ==========

export async function getPosts(page = 1, limit = 10) {
  return await apiRequest('/posts', { method: 'GET' });
}

export async function getPost(postId) {
  return await apiRequest(`/posts/${postId}`, { method: 'GET' });
}

export async function createPost(formData) {
  return await apiRequest('/posts', {
    method: 'POST',
    body: formData,
    isFormData: true
  });
}

export async function updatePost(postId, formData) {
  return await apiRequest(`/posts/${postId}`, {
    method: 'PATCH',
    body: formData,
    isFormData: true
  });
}

export async function deletePost(postId) {
  return await apiRequest(`/posts/${postId}`, { method: 'DELETE' });
}

console.log('common/api/post.js 로드 완료');