import { createContext, useContext, useReducer, useCallback } from "react";
import api from "../utils/api";

// ─── Reducer ──────────────────────────────────────────────────────────────────
const productReducer = (state, action) => {
    switch (action.type) {
        case "LOADING":
            return { ...state, loading: true, error: null };
        case "SET_LIST":
            return { ...state, loading: false, list: action.payload.products, total: action.payload.total, pages: action.payload.pages };
        case "SET_CURRENT":
            return { ...state, loading: false, current: action.payload };
        case "SET_MY_ADS":
            return { ...state, myAds: action.payload };
        case "ADD":
            return { ...state, loading: false, myAds: [action.payload, ...state.myAds], success: "Ad posted successfully!" };
        case "REMOVE":
            return {
                ...state,
                list: state.list.filter((p) => p._id !== action.payload),
                myAds: state.myAds.filter((p) => p._id !== action.payload),
                success: "Ad deleted!",
            };
        case "ERROR":
            return { ...state, loading: false, error: action.payload };
        case "CLEAR":
            return { ...state, error: null, success: null };
        default:
            return state;
    }
};

// ─── Context Setup ────────────────────────────────────────────────────────────
const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
    const [state, dispatch] = useReducer(productReducer, {
        list: [],    // all products for home page
        myAds: [],    // logged-in user's own ads
        current: null,  // single product being viewed
        total: 0,
        pages: 1,
        loading: false,
        error: null,
        success: null,
    });

    // useCallback prevents function from being recreated on every render
    // Important for useEffect dependency arrays

    // Fetch all products with optional filters (search, category, price, sort, page)
    const fetchProducts = useCallback(async (params = {}) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.get("/products", { params }); // params → ?search=phone&category=Mobiles
            dispatch({ type: "SET_LIST", payload: res.data });
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message || "Failed to load products" });
        }
    }, []);

    // Fetch a single product by ID
    const fetchProductById = useCallback(async (id) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.get(`/products/${id}`);
            dispatch({ type: "SET_CURRENT", payload: res.data });
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
        }
    }, []);

    // Fetch only the logged-in user's posted ads
    const fetchMyProducts = useCallback(async () => {
        try {
            const res = await api.get("/products/my");
            dispatch({ type: "SET_MY_ADS", payload: res.data });
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
        }
    }, []);

    // Create a new product — uses FormData because images are included
    const createProduct = async (formData) => {
        dispatch({ type: "LOADING" });
        try {
            const res = await api.post("/products", formData, {
                headers: { "Content-Type": "multipart/form-data" }, // required for file uploads
            });
            dispatch({ type: "ADD", payload: res.data });
            return true; // tell the page it was successful
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
            return false;
        }
    };

    // Delete a product by ID
    const deleteProduct = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            dispatch({ type: "REMOVE", payload: id }); // remove from both list and myAds
        } catch (err) {
            dispatch({ type: "ERROR", payload: err.response?.data?.message });
        }
    };

    const clearMessages = () => dispatch({ type: "CLEAR" });

    return (
        <ProductContext.Provider value={{
            ...state,
            fetchProducts,
            fetchProductById,
            fetchMyProducts,
            createProduct,
            deleteProduct,
            clearMessages,
        }}>
            {children}
        </ProductContext.Provider>
    );
};

// useProducts — call this in any component
export const useProducts = () => useContext(ProductContext);