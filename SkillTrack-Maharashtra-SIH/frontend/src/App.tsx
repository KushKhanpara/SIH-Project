import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import SkillGaps from "./pages/SkillGaps";
import Placements from "./pages/Placements";
import Training from "./pages/Training";
import Districts from "./pages/Districts";
import Candidates from "./pages/Candidates";
import Retention from "./pages/Retention";
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/skill-gaps" element={<SkillGaps />} />
        <Route path="/placements" element={<Placements />} />
        <Route path="/training" element={<Training />} />
        <Route path="/districts" element={<Districts />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/retention" element={<Retention />} />
      </Routes>
    </Layout>
  );
}
