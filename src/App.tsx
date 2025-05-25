import {AuthForm} from "./components/AuthForm.tsx";
import {Route, Routes} from "react-router-dom";
import {ProtectedRoute} from "./components/ProtectedRoute.tsx";
import {Dashboard} from "./pages/Dashboard.tsx";

function App() {

    return (
        <>
            <Routes>
                <Route path="/auth" element={<AuthForm/>}/>
                <Route path="/dashboard" element={<ProtectedRoute>
                    <Dashboard/>
                </ProtectedRoute>}/>
            </Routes>
        </>
    )
}

export default App
