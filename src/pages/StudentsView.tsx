import React, {useEffect, useState} from "react";
import {Navbar} from "../components/Navbar.tsx";
import {AddModal} from "../components/AddModal.tsx";
import {ConfirmationModal} from "../components/ConfirmationModal.tsx";
import {Eye, Trash} from "lucide-react";
import {Link} from "react-router-dom";
import {AnimatePresence, motion} from "framer-motion";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {Loading} from "../components/Loading";

// --- Type Definitions ---
type Course = {
    id: number;
    name: string;
    code: string;
};

type Section = {
    id: number;
    section: string;
};

type YearLevel = {
    id: number;
    year: number;
};

type Subject = {
    id: number;
    name: string;
    code: string;
    course: number;
};

type Student = {
    id: number;
    student_id: number | null;
    first_name: string;
    middle_name: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    profile_image?: string | null;
    course?: number | null;
    year_level?: number | null;
    section?: number | null;
    subject?: number[];
    created_at: string;
};

export const StudentsView = () => {
    // --- State ---
    const [students, setStudents] = useState<Student[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

    const [courses, setCourses] = useState<Course[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [yearLevels, setYearLevels] = useState<YearLevel[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [formData, setFormData] = useState<Omit<Student, "id" | "created_at">>({
        student_id: null,
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        date_of_birth: "",
        profile_image: null,
        course: null,
        year_level: null,
        section: null,
        subject: [],
    });
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

    // Loading state
    const [loading, setLoading] = useState(true);

    // --- Fetch Functions ---
    useEffect(() => {
        (async () => {
            setLoading(true);
            await fetchCourses();
            await fetchSubjects();
            await Promise.all([
                fetchStudents(),
                fetchSections(),
                fetchYearLevels(),
            ]);
            setLoading(false);
        })();
    }, []);

    const fetchStudents = async () => {
        const res = await fetch("https://djsms.onrender.com/api/students/");
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : data.results || []);
    };

    const fetchCourses = async () => {
        const res = await fetch("https://djsms.onrender.com/api/courses/");
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : data.results || []);
    };

    const fetchSections = async () => {
        const res = await fetch("https://djsms.onrender.com/api/sections/");
        const data = await res.json();
        setSections(Array.isArray(data) ? data : data.results || []);
    };

    const fetchYearLevels = async () => {
        const res = await fetch("https://djsms.onrender.com/api/yearlevels/");
        const data = await res.json();
        setYearLevels(Array.isArray(data) ? data : data.results || []);
    };

    const fetchSubjects = async () => {
        const res = await fetch("https://djsms.onrender.com/api/subjects/");
        const data = await res.json();
        setSubjects(Array.isArray(data) ? data : data.results || []);
    };

    // --- Handlers ---
    const confirmDelete = (student: Student) => setStudentToDelete(student);

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;
        await fetch(`https://djsms.onrender.com/api/students/${studentToDelete.id}/`, {method: "DELETE"});
        await fetchStudents();
        setStudentToDelete(null);
    };

    // Filter subjects based on selected course
    const filteredSubjects = formData.course
        ? subjects.filter((subject) => String(subject.course) === String(formData.course))
        : [];

    // Prepare react-select options for subjects
    const subjectOptions = filteredSubjects.map((subject) => ({
        value: subject.id,
        label: `${subject.name} (${subject.code})`,
    }));

    // Add animated components for react-select
    const animatedComponents = makeAnimated();

    const handleSubjectsChange = (selectedOptions: any) => {
        setFormData({
            ...formData,
            subject: selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [],
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const target = e.target;
        const {name, value} = target;

        if (target.type === "file") {
            const input = target as HTMLInputElement;
            if (input.files && input.files[0]) {
                setProfileImageFile(input.files[0]);
            }
        } else if (
            name === "student_id" ||
            name === "course" ||
            name === "year_level" ||
            name === "section"
        ) {
            setFormData({
                ...formData,
                [name]: value === "" ? null : Number(value),
                ...(name === "course" ? {subject: []} : {}), // Reset subject if course changes
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async () => {
        const data = new FormData();
        if (
            formData.student_id !== null &&
            formData.student_id !== undefined &&
            String(formData.student_id).trim() !== ""
        ) {
            data.append("student_id", String(formData.student_id));
        }
        if (formData.first_name) data.append("first_name", formData.first_name);
        if (formData.middle_name) data.append("middle_name", formData.middle_name);
        if (formData.last_name) data.append("last_name", formData.last_name);
        if (formData.email) data.append("email", formData.email);
        if (formData.date_of_birth) data.append("date_of_birth", formData.date_of_birth);
        if (formData.course) data.append("course", String(formData.course));
        if (formData.year_level) data.append("year_level", String(formData.year_level));
        if (formData.section) data.append("section", String(formData.section));
        if (profileImageFile) data.append("profile_image", profileImageFile);
        if (formData.subject && formData.subject.length > 0) {
            formData.subject.forEach((subjectId) => {
                data.append("subject", String(subjectId));
            });
        }

        try {
            const res = await fetch("https://djsms.onrender.com/api/students/", {
                method: "POST",
                body: data,
            });
            if (!res.ok) {
                // Show error and return early, don't throw/catch locally
                alert(
                    "Failed to add student. " +
                    JSON.stringify(await res.json())
                );
                return;
            }
            await fetchStudents();
            await fetchSubjects();
            setIsModalOpen(false);
            setFormData({
                student_id: null,
                first_name: "",
                middle_name: "",
                last_name: "",
                email: "",
                date_of_birth: "",
                profile_image: null,
                course: null,
                year_level: null,
                section: null,
                subject: [],
            });
            setProfileImageFile(null);
        } catch (err) {
            alert(
                "Failed to add student. " +
                (err && typeof err === "object" ? JSON.stringify(err) : "")
            );
        }
    };

    // --- Render ---
    if (loading) {
        return <Loading text="Loading students..."/>;
    }

    return (
        <Navbar>
            <section className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-violet-700 tracking-tight">Students</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-6 py-2 rounded-xl shadow-lg hover:from-violet-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition font-semibold text-base"
                    >
                        + Add Student
                    </button>
                </div>

                {/* Responsive Table/Card */}
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-violet-600 to-purple-500 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Student
                                    #
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">First
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Middle
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Last
                                    Name
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Date of
                                    Birth
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                            <AnimatePresence>
                                {students.map((student: Student) => (
                                    <motion.tr
                                        key={student.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, y: 10}}
                                        whileHover={{scale: 1.01, backgroundColor: "#f3f4f6"}}
                                        transition={{type: "spring", stiffness: 300, damping: 24}}
                                        tabIndex={0}
                                        className="focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    >
                                        <td className="px-4 py-3 font-mono text-sm text-gray-700">{student.student_id ?? "-"}</td>
                                        <td className="px-4 py-3">{student.first_name}</td>
                                        <td className="px-4 py-3">{student.middle_name ?? ""}</td>
                                        <td className="px-4 py-3">{student.last_name}</td>
                                        <td className="px-4 py-3">{student.email}</td>
                                        <td className="px-4 py-3">{student.date_of_birth}</td>
                                        <td className="px-4 py-3 flex space-x-2 items-center">
                                            <Link
                                                key="StudentDetailedView"
                                                to={`/StudentDetailedView/${student.id}`}
                                                className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                                aria-label={`View details for ${student.first_name} ${student.last_name}`}
                                            >
                                                <Eye size={18}/>
                                            </Link>
                                            <button
                                                onClick={() => confirmDelete(student)}
                                                className="text-red-600 hover:text-red-800 focus:outline-none"
                                                aria-label={`Delete ${student.first_name} ${student.last_name}`}
                                            >
                                                <Trash size={18}/>
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile Card List */}
                    <div className="md:hidden flex flex-col gap-4 p-4">
                        <AnimatePresence>
                            {students.map((student: Student) => (
                                <motion.div
                                    key={student.id}
                                    initial={{opacity: 0, y: 10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: 10}}
                                    className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow p-4 flex flex-col gap-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div
                                                className="text-lg font-bold text-violet-700">{student.first_name} {student.last_name}</div>
                                            <div className="text-xs text-gray-500 mb-1">{student.email}</div>
                                            <div className="text-xs text-gray-400">ID: {student.student_id ?? "-"}</div>
                                            <div className="text-xs text-gray-400">DOB: {student.date_of_birth}</div>
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            <Link
                                                key="StudentDetailedView"
                                                to={`/StudentDetailedView/${student.id}`}
                                                className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                                aria-label={`View details for ${student.first_name} ${student.last_name}`}
                                            >
                                                <Eye size={20}/>
                                            </Link>
                                            <button
                                                onClick={() => confirmDelete(student)}
                                                className="text-red-600 hover:text-red-800 focus:outline-none"
                                                aria-label={`Delete ${student.first_name} ${student.last_name}`}
                                            >
                                                <Trash size={20}/>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            <AddModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                title="Add Student"
            >
                <div className="flex flex-col gap-4">
                    <input
                        type="number"
                        name="student_id"
                        placeholder="Student Number"
                        value={formData.student_id ?? ""}
                        onChange={handleChange}
                        className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        min={1}
                        aria-label="Student Number"
                    />
                    <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        aria-label="First Name"
                    />
                    <input
                        type="text"
                        name="middle_name"
                        placeholder="Middle Name"
                        value={formData.middle_name}
                        onChange={handleChange}
                        className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        aria-label="Middle Name"
                    />
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        aria-label="Last Name"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        aria-label="Email"
                    />
                    <input
                        type="date"
                        name="date_of_birth"
                        placeholder="Date of Birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        aria-label="Date of Birth"
                    />
                    <div>
                        <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                            Course
                        </label>
                        <select
                            id="course"
                            name="course"
                            value={formData.course ?? ""}
                            onChange={handleChange}
                            className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                            aria-label="Course"
                        >
                            <option value="">Select course</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name} ({course.code})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="year_level" className="block text-sm font-medium text-gray-700 mb-1">
                            Year Level
                        </label>
                        <select
                            id="year_level"
                            name="year_level"
                            value={formData.year_level ?? ""}
                            onChange={handleChange}
                            className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                            aria-label="Year Level"
                        >
                            <option value="">Select year level</option>
                            {yearLevels.map((yl) => (
                                <option key={yl.id} value={yl.id}>
                                    Year {yl.year}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                            Section
                        </label>
                        <select
                            id="section"
                            name="section"
                            value={formData.section ?? ""}
                            onChange={handleChange}
                            className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                            aria-label="Section"
                        >
                            <option value="">Select section</option>
                            {sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.section}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Subject Picker: Only show if course is selected */}
                    <div>
                        <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-1">
                            Subjects
                        </label>
                        <Select
                            inputId="subjects"
                            isMulti
                            isSearchable
                            name="subjects"
                            options={subjectOptions}
                            value={subjectOptions.filter(opt => formData.subject?.includes(opt.value))}
                            onChange={handleSubjectsChange}
                            isDisabled={!formData.course}
                            classNamePrefix="react-select"
                            placeholder="Select subjects..."
                            components={animatedComponents}
                        />
                        <span className="text-xs text-gray-500">You can search and select multiple subjects.</span>
                    </div>
                    <input
                        type="file"
                        name="profile_image"
                        onChange={handleChange}
                        className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                        aria-label="Upload Photo"
                    />
                </div>
            </AddModal>

            <ConfirmationModal
                isOpen={!!studentToDelete}
                message={`Are you sure you want to delete ${studentToDelete?.first_name} ${studentToDelete?.last_name}?`}
                onClose={() => setStudentToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </Navbar>
    );
};
