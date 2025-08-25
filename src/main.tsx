// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

function App() {
  return (
    <main className="p-6 font-sans">
      <h1 className="text-2xl font-semibold">RYNE Vite + Tailwind is working ✅</h1>
      <p className="mt-2 text-sm text-gray-600">Hot reload + Tailwind utilities are active.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
