import {useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {motion, AnimatePresence} from "framer-motion";
import {LogoutModal} from "./LogoutModal";
import {Menu, X} from "lucide-react";
import CvSUFlowLogo from "../assets/CvSU_Flow_Logo.png";

export const Navbar = ({children}: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const links = [
        {name: "Dashboard", href: "/dashboard"},
        {name: "Students", href: "/StudentsView"},
        {name: "Courses", href: "/CoursesView"},
        {name: "Subjects", href: "/SubjectsView"},
        {name: "Quizzes", href: "/QuizzesView"},
        {name: "Activities", href: "/ActivitiesView"},
        {name: "Exams", href: "/ExamsView"},
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);
    const confirmLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50 to-white">
            {/* Sidebar */}
            <LogoutModal
                isOpen={showModal}
                onCancel={() => setShowModal(false)}
                onConfirm={confirmLogout}
            />

            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleSidebar}
                    className="text-purple-700 bg-white rounded-full shadow-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
                    aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                >
                    {isOpen ? <X size={28}/> : <Menu size={28}/>}
                </button>
            </div>

            {/* Sidebar */}
            <AnimatePresence>
                {(isOpen || window.innerWidth >= 768) && (
                    <motion.aside
                        initial={{x: -300, opacity: 0}}
                        animate={{x: 0, opacity: 1}}
                        exit={{x: -300, opacity: 0}}
                        transition={{type: "spring", stiffness: 300, damping: 30}}
                        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-r-purple-700 shadow-xl z-40
                        flex flex-col justify-between p-6 md:flex`}
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-10 mt-10 md:mt-0">
                                <img
                                    src={CvSUFlowLogo}
                                    alt="CvSU Flow Logo"
                                    className="w-10 h-10 rounded-full shadow object-cover bg-white"
                                />
                                <h1 className="text-2xl font-extrabold text-purple-700 tracking-tight font-serif italic">CvSU Flow</h1>
                            </div>
                            <nav className="flex flex-col gap-1">
                                {links.map((link) => {
                                    const isActive = location.pathname === link.href;
                                    return (
                                        <a
                                            key={link.name}
                                            href={link.href}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium transition
                                                ${isActive
                                                ? "bg-gradient-to-r from-purple-100 to-violet-50 text-purple-700 shadow font-bold"
                                                : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"}`}
                                            tabIndex={0}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            {link.name}
                                        </a>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="mt-8">
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full text-left px-4 py-2 text-base text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                            >
                                Logout
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-transparent p-2 sm:p-4 md:ml-64 transition-all duration-300">
                <div className="max-w-7xl mx-auto min-h-screen">
                    {children}
                </div>
            </main>
        </div>
    );
};
