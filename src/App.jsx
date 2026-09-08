import { Routes, Route, Link } from 'react-router-dom'
import DestinationsPage from './pages/DestinationsPage'
import CreateDestinationPage from './pages/CreateDestinationPage'
import DestinationDetailsPage from './pages/DestinationDetailsPage'

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            EntryGraph
          </Link>

          <p className="subtitle">
            Explore and manage destinations
          </p>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={<DestinationsPage />}
        />

        <Route
          path="/destinations/new"
          element={<CreateDestinationPage />}
        />

        <Route
          path="/destinations/:id"
          element={<DestinationDetailsPage />}
        />
      </Routes>
    </div>
  )
}

export default App
