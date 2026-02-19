import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import TaskBoard from "./components/tasks/TaskBoard";
import IdeaList from "./components/ideas/IdeaList";
import JournalList from "./components/journal/JournalList";
import TerminalPanel from "./components/terminal/TerminalPanel";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<TaskBoard />} />
          <Route path="/ideas" element={<IdeaList />} />
          <Route path="/journal" element={<JournalList />} />
          <Route path="/terminal" element={<TerminalPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
