import {AuthForm} from "./components/AuthForm.tsx";
import {Route, Routes} from "react-router-dom";
import {ProtectedRoute} from "./components/ProtectedRoute.tsx";
import {Dashboard} from "./pages/Dashboard.tsx";
import {StudentsView} from "./pages/StudentsView.tsx";
import {CoursesView} from "./pages/CoursesView.tsx";
import {ExamsView} from "./pages/ExamsView.tsx";
import {SubjectsView} from "./pages/SubjectsView.tsx";
import {QuizzesView} from "./pages/QuizzesView.tsx";
import {ActivitiesView} from "./pages/ActivitiesView.tsx";
import {StudentDetailedView} from "./pages/StudentDetailedView.tsx";
function App() {

    return (
        <Routes>
            <Route path="/" element={<AuthForm/>}/>
            <Route path="/dashboard" element={<ProtectedRoute>
                <Dashboard/>
            </ProtectedRoute>}/>
            <Route path="/StudentsView" element={<ProtectedRoute>
                <StudentsView/>
            </ProtectedRoute>}></Route>
            <Route path="/StudentDetailedView/:id" element={<ProtectedRoute>
                <StudentDetailedView/>
            </ProtectedRoute>}></Route>
            <Route path="/CoursesView" element={<ProtectedRoute>
                <CoursesView/>
            </ProtectedRoute>}></Route>
            <Route path="/SubjectsView" element={<ProtectedRoute>
                <SubjectsView/>
            </ProtectedRoute>}></Route>
            <Route path="/QuizzesView" element={<ProtectedRoute>
                <QuizzesView/>
            </ProtectedRoute>}></Route>
            <Route path="/ActivitiesView" element={<ProtectedRoute>
                <ActivitiesView/>
            </ProtectedRoute>}></Route>
            <Route path="/ExamsView" element={<ProtectedRoute>
                <ExamsView/>
            </ProtectedRoute>}></Route>
        </Routes>
    )
}

export default App
