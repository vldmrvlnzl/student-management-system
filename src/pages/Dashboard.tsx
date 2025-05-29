import { Navbar } from "../components/Navbar.tsx";
import React, { useEffect, useState } from "react";
import { Users, BookOpen, Layers, FileText, ClipboardList, FileBadge2 } from "lucide-react";

type StatCardProps = {
    count: number | string;
    label: string;
    icon: React.ReactNode;
    color: string;
    description: string;
};

const StatCard: React.FC<StatCardProps> = ({ count, label, icon, color, description }) => (
    <div
        className="rounded-2xl shadow-lg border-2 p-6 flex flex-col items-center bg-white transition-transform hover:scale-[1.03] hover:shadow-xl border-opacity-30"
        style={{ borderColor: color }}
    >
        <div className="flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: `${color}10` }}>
            {React.cloneElement(icon as React.ReactElement, { size: 32, color })}
        </div>
        <div className="text-4xl font-extrabold mb-1" style={{ color }}>
            {count}
        </div>
        <div className="text-base font-semibold text-gray-700 tracking-wide uppercase mb-1">{label}</div>
        <div className="text-xs text-gray-500 text-center">{description}</div>
    </div>
);

export const Dashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        courses: 0,
        subjects: 0,
        quizzes: 0,
        activities: 0,
        exams: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [
                    studentsRes,
                    coursesRes,
                    subjectsRes,
                    quizzesRes,
                    activitiesRes,
                    examsRes,
                ] = await Promise.all([
                    fetch("http://127.0.0.1:8000/api/students/"),
                    fetch("http://127.0.0.1:8000/api/courses/"),
                    fetch("http://127.0.0.1:8000/api/subjects/"),
                    fetch("http://127.0.0.1:8000/api/quizzes/"),
                    fetch("http://127.0.0.1:8000/api/activities/"),
                    fetch("http://127.0.0.1:8000/api/exams/"),
                ]);
                const [students, courses, subjects, quizzes, activities, exams] = await Promise.all([
                    studentsRes.json(),
                    coursesRes.json(),
                    subjectsRes.json(),
                    quizzesRes.json(),
                    activitiesRes.json(),
                    examsRes.json(),
                ]);
                setStats({
                    students: Array.isArray(students) ? students.length : students.count ?? 0,
                    courses: Array.isArray(courses) ? courses.length : courses.count ?? 0,
                    subjects: Array.isArray(subjects) ? subjects.length : subjects.count ?? 0,
                    quizzes: Array.isArray(quizzes) ? quizzes.length : quizzes.count ?? 0,
                    activities: Array.isArray(activities) ? activities.length : activities.count ?? 0,
                    exams: Array.isArray(exams) ? exams.length : exams.count ?? 0,
                });
            } catch {
                setStats({
                    students: 0,
                    courses: 0,
                    subjects: 0,
                    quizzes: 0,
                    activities: 0,
                    exams: 0,
                });
            } finally {
                setLoading(false);
            }
        };
        void fetchStats();
    }, []);

    const cardData = [
        {
            label: "Students",
            icon: <Users />,
            color: "#7c3aed",
            description: "Total enrolled students in the system.",
            count: loading ? "..." : stats.students,
        },
        {
            label: "Courses",
            icon: <BookOpen />,
            color: "#2563eb",
            description: "Available courses for all students.",
            count: loading ? "..." : stats.courses,
        },
        {
            label: "Subjects",
            icon: <Layers />,
            color: "#059669",
            description: "Subjects offered across all courses.",
            count: loading ? "..." : stats.subjects,
        },
        {
            label: "Quizzes",
            icon: <FileText />,
            color: "#d97706",
            description: "Quizzes created for student assessment.",
            count: loading ? "..." : stats.quizzes,
        },
        {
            label: "Activities",
            icon: <ClipboardList />,
            color: "#db2777",
            description: "Class activities and assignments.",
            count: loading ? "..." : stats.activities,
        },
        {
            label: "Exams",
            icon: <FileBadge2 />,
            color: "#f43f5e",
            description: "Major exams for grading and evaluation.",
            count: loading ? "..." : stats.exams,
        },
    ];

    return (
        <Navbar>
            <div className="w-full px-2 md:px-8 max-w-7xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 text-gray-800 text-center tracking-tight">
                    Dashboard Overview
                </h1>
                <div className="mb-8 text-center text-gray-500 text-sm max-w-2xl mx-auto">
                    Welcome to your student management dashboard. Here you can quickly view the key statistics of your system, including students, courses, subjects, and assessments. All data is updated in real-time.
                </div>
                {/* Responsive Masonry/Column Grid */}
                <div
                    className="
                            grid grid-cols-1
                            sm:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-4
                            gap-6
                            mb-10
                        "
                >
                    {cardData.map((card) => (
                        <StatCard
                            key={card.label}
                            count={card.count}
                            label={card.label}
                            icon={card.icon}
                            color={card.color}
                            description={card.description}
                        />
                    ))}
                </div>
                {/* Extra details section */}
                <div className="bg-gradient-to-br from-violet-50 to-white rounded-2xl shadow-inner p-6 mt-4 flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex-1 text-gray-700 text-base">
                        <div className="font-bold text-lg mb-1 text-violet-700">How to use this dashboard?</div>
                        <ul className="list-disc ml-5 text-sm space-y-1">
                            <li>Click on the navigation menu to manage students, courses, and grades.</li>
                            <li>Monitor the number of quizzes, activities, and exams to keep your curriculum up-to-date.</li>
                            <li>All statistics update automatically as you add or remove data.</li>
                        </ul>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                        <img
                            src="https://illustrations.popsy.co/gray/student.svg"
                            alt="Student illustration"
                            className="w-40 h-40 object-contain mb-2"
                            loading="lazy"
                        />
                        <span className="text-xs text-gray-400">Your data is always secure and private.</span>
                    </div>
                </div>
            </div>
        </Navbar>
    );
};