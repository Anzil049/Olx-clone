// Reusable loading spinner
// Usage: <Loader /> or <Loader text="Fetching products..." />
const Loader = ({ text = "Loading..." }) => (
    <div className="loader-wrapper">
        <div className="spinner" />
        <p>{text}</p>
    </div>
);

export default Loader;