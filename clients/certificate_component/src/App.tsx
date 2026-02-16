import React from 'react';
import { Route, Routes } from 'react-router-dom';
import OverviewPage from './OverviewPage';
import SettingsPage from './SettingsPage';
import StudentCertificatePage from './StudentCertificatePage';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
    const { user } = useAuth();
    const isInstructor = user?.roles?.includes('instructor');

    return (
        <Routes>
            {isInstructor ? (
                <>
                    <Route path="/" element={<OverviewPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </>
            ) : (
                <Route path="/" element={<StudentCertificatePage />} />
            )}
        </Routes>
    );
};

export default App;
