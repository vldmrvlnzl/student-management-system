import {useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {motion} from "framer-motion";
import {LogoutModal} from "./LogoutModal";
import {Menu, X} from "lucide-react";

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const links = [
        {name: "Dashboard", href: "/dashboard"},
        {name: "Students", href: "/student"},
        {name: "Teachers", href: "/teacher"},
        {name: "Courses", href: "/course"},
        {name: "Subjects", href: "/subject"},
        {name: "Quizzes", href: "/quiz"},
        {name: "Activities", href: "/activity"},
        {name: "Exams", href: "/exam"},
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);
    const confirmLogout = () => {
        localStorage.removeItem("token");
        navigate("/auth");
    };

    return (
        <>
            <LogoutModal
                isOpen={showModal}
                onCancel={() => setShowModal(false)}
                onConfirm={confirmLogout}
            />

            {/* Mobile menu toggle button */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button onClick={toggleSidebar} className="text-gray-700">
                    {isOpen ? <X size={28}/> : <Menu size={28}/>}
                </button>
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={{x: -250}}
                animate={{x: isOpen || window.innerWidth >= 768 ? 0 : -250}}
                transition={{duration: 0.3}}
                className={`fixed md:static top-0 left-0 h-full md:h-screen w-64 bg-white border-r border-r-purple-700 shadow-md z-40
                    flex flex-col justify-between p-6
                    ${isOpen ? "block" : "hidden"} md:flex`}
            >
                {/* Top Section */}
                <div>
                    <h1 className="text-3xl font-bold text-purple-700 mb-8 mt-12 md:mt-0"
                        style={{fontFamily: "'Playfair Display', italic"}}>CvSU Flow</h1>
                    <nav className="flex flex-col gap-2">
                        {links.map((link) => {
                            const isActive = location.pathname === link.href;
                            return (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className={`block px-3 py-2 rounded-md text-sm font-medium transition 
                                        ${isActive
                                        ? "bg-purple-100 text-purple-700"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-purple-600"}`}
                                >
                                    {link.name}
                                </a>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium transition"
                    >
                        Logout
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Offset (for desktop) */}
            <div className="md:ml-64 w-full min-h-screen bg-gray-50">
                {/* Your main content here */}
            </div>
        </>
    );
};
