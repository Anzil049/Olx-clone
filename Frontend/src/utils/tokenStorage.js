// utils/tokenStorage.js

const TOKEN_KEY = "token";
const EXPIRY_KEY = "token_expiry";
const EXPIRY_DURATION = 15 * 60 * 1000; // 15 minutes in ms

export const saveToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EXPIRY_KEY, Date.now() + EXPIRY_DURATION);
};

export const getToken = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);

    if (!token || !expiry) return null;

    if (Date.now() > Number(expiry)) {
        clearToken(); // auto-remove expired token
        return null;
    }

    return token;
};

export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
};