import { useState, useEffect, useCallback } from "react";
import { useProducts } from "../context/ProductContext";

// Custom hook — encapsulates all filter/search/sort/pagination logic
// Used in the Home page so the component stays clean
const useProductFilters = () => {
    const { fetchProducts } = useProducts();

    const [filters, setFilters] = useState({
        search: "",
        category: "",
        minPrice: "",
        maxPrice: "",
        sort: "-createdAt", // newest first by default
        page: 1,
    });

    useEffect(() => {
        // Debounce — wait 500ms after user stops typing before calling API
        // This prevents an API call on every single keystroke
        const timer = setTimeout(() => {
            // Remove empty values so URL query string stays clean
            const clean = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== "")
            );
            fetchProducts(clean);
        }, 500);

        return () => clearTimeout(timer); // cancel previous timer on next change
    }, [filters]);

    // Update a single filter and reset to page 1
    const setFilter = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    }, []);

    // Change page without resetting other filters
    const setPage = useCallback((page) => {
        setFilters((prev) => ({ ...prev, page }));
    }, []);

    return { filters, setFilter, setPage };
};

export default useProductFilters;