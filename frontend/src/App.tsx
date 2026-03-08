import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import StrollerControl from "./pages/StrollerControl";
import RunSession from "./pages/RunSession";
import TrainingPlans from "./pages/TrainingPlans";
import RunHistory from "./pages/RunHistory";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stroller" element={<StrollerControl />} />
          <Route path="/run" element={<RunSession />} />
          <Route path="/training" element={<TrainingPlans />} />
          <Route path="/history" element={<RunHistory />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
