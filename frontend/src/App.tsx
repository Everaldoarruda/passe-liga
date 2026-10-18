import { Navigate, Route, Routes } from 'react-router';
import Layout from './components/Layout';
import ClubPage from './pages/ClubPage';
import ClubsPage from './pages/ClubsPage';
import MatchesPage from './pages/MatchesPage';
import PlayersPage from './pages/PlayersPage';
import StandingsPage from './pages/StandingsPage';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/players" replace />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/clubs/:id" element={<ClubPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/standings" element={<StandingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
