import { ThemeProvider, useTheme } from './context/ThemeContext';

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#e2e8f0' : '#1e293b',
            border: `1px solid ${isDark ? 'rgba(0, 232, 122, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="ai-insights" element={<AiInsightsPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl mb-4">🔍</p>
              <h1 className="text-3xl font-bold text-primary mb-2">Page Not Found</h1>
              <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-gradient inline-block no-underline">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
