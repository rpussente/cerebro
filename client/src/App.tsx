import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import TaskBoard from "./components/tasks/TaskBoard";
import IdeaList from "./components/ideas/IdeaList";

function Placeholder({ name }: { name: string }) {
  return <p style={{ color: "#888" }}>{name} — coming soon</p>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TaskBoard />} />
          <Route path="/ideas" element={<IdeaList />} />
          <Route path="/journal" element={<Placeholder name="Journal" />} />
          <Route path="/terminal" element={<Placeholder name="Terminal" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
