// File: src/services/auth.js
export const authService = {
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  getAdmin: () => {
    const admin = localStorage.getItem("admin");
    return admin ? JSON.parse(admin) : null;
  },

  login: (token, admin) => {
    localStorage.setItem("token", token);
    localStorage.setItem("admin", JSON.stringify(admin));
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
  },
};
