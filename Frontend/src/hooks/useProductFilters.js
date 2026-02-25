import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../context/ProductContext";

const useProductFilters = () => {
    const { fetchProducts } = useProducts();
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        category: "",
        minPrice: "",
        maxPrice: "",
        sort: "-createdAt",
        page: 1,
    });

    // Sync search from URL changes
    useEffect(() => {
        const urlSearch = searchParams.get("search") || "";
        setFilters((prev) =>
            prev.search !== urlSearch ? { ...prev, search: urlSearch, page: 1 } : prev
        );
    }, [searchParams]);

    // Debounced fetch on filter change
    useEffect(() => {
        const timer = setTimeout(() => {
            const clean = Object.fromEntries(
                Object.entries(filters).filter(([, v]) => v !== "")
            );
            fetchProducts(clean);
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, fetchProducts]);

    const setFilter = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    }, []);

    const setPage = useCallback((page) => {
        setFilters((prev) => ({ ...prev, page }));
    }, []);

    return { filters, setFilter, setPage };
};

export default useProductFilters;