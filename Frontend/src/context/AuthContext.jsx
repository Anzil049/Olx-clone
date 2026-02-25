import { createContext, useContext, useReducer, useEffect } from "react";
import api from "../utils/api";
import { saveToken, getToken, clearToken } from "../utils/tokenStorage"; // ✅ add this



// ─── Reducer ────────────────────────────────────────────────────────────────
// All state changes happen here — keeps logic in one place
const authReducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return { ...state, loading: true, error: null };
        case "SUCCESS":
            return { ...state, loading: false, user: action.payload, token: action.payload.token ?? state.token, error: null };
        case "ERROR":
            return { ...state, loading: false, error: action.payload };
        case "UPDATE":
            // Merge only the changed fields into the existing user object
            return { ...state, loading: false, user: { ...state.user, ...action.payload } };
        case "LOGOUT":
            return { ...state, user: null, token: null };
        case "CLEAR":
            return { ...state, error: null };
        default:
            return state;
    }
};

// ─── Context Setup ────────────────────────────────────────────────────────────
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        token: getToken(), // rehydrate token on page refresh
        loading: false,
        error: null,
    });

    // Register new user
    const register = async (formData) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.post("/auth/register", formData);
            saveToken(res.data.token);
            dispatch({ type: "SUCCESS", payload: res.data });
            return true;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message || "Registration failed" });
            return false;
        }
    };

    // Add fetchMe function inside AuthProvider
    const fetchMe = async () => {
        const token = getToken();
        if (!token) return; // no token, skip
        dispatch({ type: "LOADING" });
        try {
            const res = await api.get("/auth/me"); // your get current user endpoint
            dispatch({ type: "SUCCESS", payload: res.data });
        } catch (err) {
            clearToken();
            dispatch({ type: "LOGOUT" }); // token invalid, clear everything
        }
    };

    // Call it once when app starts
    useEffect(() => {
        fetchMe();
    }, []); // ← empty array = runs only once on mount

    // Login existing user
    const login = async (formData) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.post("/auth/login", formData);
            saveToken(res.data.token);
            dispatch({ type: "SUCCESS", payload: res.data });
            return true;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message || "Login failed" });
            return false;
        }
    };

    // Logout — blacklist token on server, clear local storage
    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } finally {
            // Always clear even if server call fails
            clearToken();
            dispatch({ type: "LOGOUT" });
        }
    };

    // Update profile fields (name, phone, password)
    const updateProfile = async (data) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.put("/users/profile", data);
            dispatch({ type: "UPDATE", payload: res.data });
            return true;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
            return false;
        }
    };

    // Add a new role to current user e.g buyer adds "seller"
    const addRole = async (role) => {
        try {
            const res = await api.put("/users/add-role", { role });
            dispatch({ type: "UPDATE", payload: { roles: res.data.roles } });
            return res.data.message;
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
        }
    };

    // Shorthand — check if user has a specific role
    const hasRole = (role) => state.user?.roles?.includes(role);

    const clearError = () => dispatch({ type: "CLEAR" });

    return (
        <AuthContext.Provider value={{
            ...state,
            register,
            login,
            logout,
            updateProfile,
            addRole,
            hasRole,
            clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// useAuth — call this in any component instead of useContext(AuthContext)
export const useAuth = () => useContext(AuthContext);