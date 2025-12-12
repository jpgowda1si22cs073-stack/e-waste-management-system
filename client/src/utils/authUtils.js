// src/utils/authUtils.js

export const checkAuth = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const isAuthorized = (allowedRoles) => {
  const user = checkAuth();
  return user && allowedRoles.includes(user.role);
};
