import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Controlled search input — on submit, navigates to /?search=query
const SearchBar = () => {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/?search=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Search cars, phones, furniture..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit">🔍</button>
        </form>
    );
};

export default SearchBar;