// /src/api/messageService.js

import API from './axios';

// Get inbox for current user
export const getInbox = async () => {
  const res = await API.get('/messages/inbox');
  return res.data;
};

// Get conversation between two users
export const getConversation = async (userId1, userId2) => {
  const res = await API.get(`/messages/${userId1}/${userId2}`);
  return res.data;
};

// Send a new message
export const sendMessage = async (messageData) => {
  const res = await API.post('/messages', messageData);
  return res.data;
};

// Mark conversation as read
export const markConversationAsRead = async (data) => {
  const res = await API.post('/messages/mark-read', data);
  return res.data;
};

// Mark one message as read
export const markMessageAsRead = async (messageId) => {
  const res = await API.patch(`/messages/${messageId}/read`);
  return res.data;
};
