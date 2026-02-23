// Reusable alert for success/error messages
// Usage: <Alert message={error} type="error" />
//        <Alert message={success} type="success" />
const Alert = ({ message, type = "error" }) => {
  if (!message) return null; // render nothing if no message to show

  return (
    <div className={`alert alert-${type}`}>
      {type === "error" ? "❌" : "✅"} {message}
    </div>
  );
};

export default Alert;