import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SearchBar = () => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Sync the input value with the URL (so if the URL search clears, the input clears)
    useEffect(() => {
        setQuery(searchParams.get("search") || "");
    }, [searchParams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/?search=${encodeURIComponent(query.trim())}`);
        } else {
            // FIX: If the search is empty, navigate back to all products
            navigate(`/`); 
        }
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">🔍</button>
        </form>
    );
};

export default SearchBar;