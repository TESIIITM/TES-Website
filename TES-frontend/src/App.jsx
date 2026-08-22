import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Articles from "./pages/Articles";
import About from "./pages/About";

export default function App() {
  return (
    <Router basename={import.meta.env.PROD ? "/TES-Website" : "/"}>
      <Routes>
        {/* Everything inside this route uses the Layout wrapper (Header + Styling) */}
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/articles" element={<Articles />} />
        </Route>
      </Routes>
    </Router>
  );
}
