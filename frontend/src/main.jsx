import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { Toaster } from "@/components/ui/sonner";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode >
    
    {/* <div className="w-full h-full bg-gray-100 "> */}

      <App/>
      <Toaster richColors position="top-right" />
    {/* </div> */}
  </React.StrictMode>
);
