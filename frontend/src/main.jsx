// main.jsx este punctul de intrare al aplicației.
// Aici React "bagă" aplicația în elementul <div id="root"></div> din index.html.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter} from "react-router-dom";//spune aplicatiei ca va avea navigare intre pagini
import App from "./App";//import componenta principala aplicatie
import "./styles/auth.css";
import "./styles/responsive.css";
import "./styles/style.css";
import { AuthProvider } from "./context/AuthContext";

// createRoot pornește aplicația React modernă.
ReactDOM.createRoot(document.getElementById("root")).render(
  // StrictMode ajută în dezvoltare să observi mai ușor unele probleme.
  <React.StrictMode>
    {/* BrowserRouter "îmbracă" aplicația și activează sistemul de rute */}
    <BrowserRouter>
      <AuthProvider>
      <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)