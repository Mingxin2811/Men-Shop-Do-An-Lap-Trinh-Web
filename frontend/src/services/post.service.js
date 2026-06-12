import api from './api';

export const postService = {
  getPosts: () => api.get('/posts'),
  getPost: (slug) => api.get(`/posts/${slug}`),
  getAdminPosts: (params) => api.get('/posts/admin/all', { params }),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
};
