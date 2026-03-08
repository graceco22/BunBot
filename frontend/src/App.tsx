import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import StrollerControl from "./pages/StrollerControl";
import RunSession from "./pages/RunSession";
import Insights from "./pages/Insights";
import TrainingPlans from "./pages/TrainingPlans";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pacer" element={<StrollerControl />} />
          <Route path="/run" element={<RunSession />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/training" element={<TrainingPlans />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
