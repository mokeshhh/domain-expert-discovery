// src/utils/auth.js
// utils/auth.js

export function login(token) {
  // replace localStorage.setItem with sessionStorage.setItem
  sessionStorage.setItem('authToken', token);
}

export function logout() {
  sessionStorage.removeItem('authToken');
}

export function isLoggedIn() {
  return !!sessionStorage.getItem('authToken');
}
