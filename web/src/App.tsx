import { useEffect, useState } from "react";
import { greet } from "@shared/index";
import "./App.css";

function App() {
  const [msg, setMsg] = useState("...");

  useEffect(() => {
    fetch("/api/hello")
      .then((r) => r.json())
      .then((d) => setMsg(d.message));
  }, []);

  return (
    <div>
      <h1>{greet({ id: "2", name: "Client" })}</h1>
      <p>API says: {msg}</p>
    </div>
  );
}

export default App;
