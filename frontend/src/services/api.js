// API service utility
const API_URL = process.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (username, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },
};

// Rooms API
export const roomsAPI = {
  getLiveRooms: async (limit = 50, offset = 0) => {
    const response = await fetch(
      `${API_URL}/rooms?limit=${limit}&offset=${offset}`
    );
    return handleResponse(response);
  },

  getRoom: async (roomId) => {
    const response = await fetch(`${API_URL}/rooms/${roomId}`);
    return handleResponse(response);
  },

  createRoom: async (title, description, category) => {
    const response = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ title, description, category }),
    });
    return handleResponse(response);
  },

  updateRoom: async (roomId, data) => {
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  endRoom: async (roomId) => {
    const response = await fetch(`${API_URL}/rooms/${roomId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMyRooms: async () => {
    const response = await fetch(`${API_URL}/rooms/my/rooms`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  searchRooms: async (query) => {
    const response = await fetch(
      `${API_URL}/rooms/search?q=${encodeURIComponent(query)}`
    );
    return handleResponse(response);
  },
};

// Users API
export const usersAPI = {
  getUser: async (username) => {
    const response = await fetch(`${API_URL}/users/${username}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  followUser: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/follow`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  unfollowUser: async (userId) => {
    const response = await fetch(`${API_URL}/users/${userId}/follow`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  searchUsers: async (query) => {
    const response = await fetch(
      `${API_URL}/users/search?q=${encodeURIComponent(query)}`
    );
    return handleResponse(response);
  },

  getLiveFollowing: async () => {
    const response = await fetch(`${API_URL}/users/following/live`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Streams API
export const streamsAPI = {
  getStreamToken: async (roomId) => {
    const response = await fetch(`${API_URL}/streams/${roomId}/token`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStreamStats: async (roomId) => {
    const response = await fetch(`${API_URL}/streams/${roomId}/stats`);
    return handleResponse(response);
  },

  getStreamMessages: async (roomId) => {
    const response = await fetch(`${API_URL}/streams/${roomId}/messages`);
    return handleResponse(response);
  },

  banUser: async (roomId, userId) => {
    const response = await fetch(`${API_URL}/streams/${roomId}/ban/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  unbanUser: async (roomId, userId) => {
    const response = await fetch(`${API_URL}/streams/${roomId}/ban/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export default {
  auth: authAPI,
  rooms: roomsAPI,
  users: usersAPI,
  streams: streamsAPI,
};
// nói chung là không có gì hết á
