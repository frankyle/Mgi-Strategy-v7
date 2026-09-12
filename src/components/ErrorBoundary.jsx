import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Still logs to the console for debugging, same as before —
    // this just ALSO shows something on screen instead of nothing.
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
            background: "#0f172a",
            color: "#f1f5f9",
          }}
        >
          <div style={{ maxWidth: 560, textAlign: "left" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              Something went wrong loading MGI Journal
            </h1>
            <p style={{ color: "#94a3b8", marginBottom: "1rem" }}>
              This is usually a missing environment variable rather than a code
              problem. Open the browser console (F12) for the full error, or check:
            </p>
            <ul style={{ color: "#94a3b8", marginBottom: "1rem", paddingLeft: "1.25rem" }}>
              <li>Vercel Project Settings → Environment Variables has both
                REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY set</li>
              <li>A new deploy was triggered AFTER adding/changing those variables</li>
            </ul>
            <pre
              style={{
                background: "#1e293b",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                overflowX: "auto",
                fontSize: "0.8rem",
                color: "#fca5a5",
              }}
            >
              {String(this.state.error?.message || this.state.error)}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
