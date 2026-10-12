import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import TimesheetPage from "./pages/TimesheetPage";
import Auth from "./components/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeList from "./components/EmployeeList";
import Layout from "./components/Layout";
import WeekPlannerPage from "./pages/WeekPlannerPage";

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<TimesheetPage />} />
              <Route path="/planning" element={<WeekPlannerPage />} />
              <Route path="/employees" element={<EmployeeList />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
