import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Map from './components/Map';

// Placeholder for other pages
const Dashboard = () => <div className="p-4"><h1>Dashboard (Coming Soon)</h1></div>;
const NotFound = () => <div className="p-4"><h1>404: Page Not Found</h1></div>;

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Navigate to="/map" replace />} />
                    <Route path="/map" element={<Map />} />
                    <Route path="/incidents" element={<Map />} /> {/* Re-use Map for now */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
