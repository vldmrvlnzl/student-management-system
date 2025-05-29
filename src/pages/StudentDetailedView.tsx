import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {motion, AnimatePresence} from "framer-motion";
import {Pencil, Trash2, ArrowLeft, Plus} from "lucide-react";
import {Navbar} from "../components/Navbar";
import {ConfirmationModal} from "../components/ConfirmationModal";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { QuizGrades } from "../components/QuizGrades";
import { ActivityGrades } from "../components/ActivityGrades";
import { ExamGrades } from "../components/ExamGrades";

type Subject = {
    id: string;
    name: string;
    code: string;
    course?: string;
};

type Course = {
    id: string;
    name: string;
    code?: string;
};

type YearLevel = {
    id: string;
    year: string;
};

type Section = {
    id: string;
    section: string;
};

type Student = {
    id: string;
    student_id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    date_of_birth: string;
    profile_image?: string;
    course?: Course | null;
    year_level?: YearLevel | null;
    section?: Section | null;
    subject: Subject[];
};

type SubjectOption = {
    value: string;
    label: string;
    course?: string;
};

export const StudentDetailedView: React.FC = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        student_id: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        date_of_birth: "",
        course: "",
        year_level: "",
        section: "",
        profile_image: undefined as File | undefined,
        profile_image_preview: "",
    });

    const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
    const [allSubjects, setAllSubjects] = useState<SubjectOption[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<SubjectOption[]>([]);
    const [addSubjectLoading, setAddSubjectLoading] = useState(false);

    const [courses, setCourses] = useState<Course[]>([]);

    const fetchStudent = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/students/${id}/`);
            if (!res.ok) {
                setStudent(null);
                setLoading(false);
                return;
            }
            const data = await res.json();

            const [course, year_level, section, subjects] = await Promise.all([
                data.course ? fetch(`http://127.0.0.1:8000/api/courses/${data.course}/`).then(r => r.json()) : null,
                data.year_level ? fetch(`http://127.0.0.1:8000/api/yearlevels/${data.year_level}/`).then(r => r.json()) : null,
                data.section ? fetch(`http://127.0.0.1:8000/api/sections/${data.section}/`).then(r => r.json()) : null,
                data.subject?.length
                    ? Promise.all(
                        data.subject.map((sid: string) =>
                            fetch(`http://127.0.0.1:8000/api/subjects/${sid}/`).then(r => r.json())
                        )
                    )
                    : [],
            ]);

            setStudent({
                ...data,
                course,
                year_level,
                section,
                subject: subjects,
            });
        } catch (e) {
            setStudent(null);
            // Add error logging for debugging
            console.error("StudentDetailedView fetchStudent error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            (async () => {
                await fetchStudent();
            })();
        }
    }, [id]);

    useEffect(() => {
        if (student) {
            // Extracted profile image preview logic
            let profileImagePreview = "";
            if (student.profile_image) {
                if (student.profile_image.startsWith("http")) {
                    profileImagePreview = student.profile_image;
                } else {
                    profileImagePreview = `http://127.0.0.1:8000${student.profile_image}`;
                }
            }
            setEditForm({
                student_id: student.student_id ? String(student.student_id) : "",
                first_name: student.first_name ?? "",
                middle_name: student.middle_name ?? "",
                last_name: student.last_name ?? "",
                email: student.email ?? "",
                date_of_birth: student.date_of_birth ?? "",
                course: student.course?.id ?? "",
                year_level: student.year_level?.id ?? "",
                section: student.section?.id ?? "",
                profile_image: undefined,
                profile_image_preview: profileImagePreview,
            });
        }
    }, [student]);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/courses/")
            .then(res => res.json())
            .then(data => setCourses(Array.isArray(data) ? data : data.results ?? []));
    }, []);

    useEffect(() => {
        if (isAddSubjectModalOpen) {
            fetch("http://127.0.0.1:8000/api/subjects/")
                .then(res => res.json())
                .then(data => {
                    setAllSubjects(
                        data.map((s: Subject) => ({
                            value: s.id,
                            label: `${s.code} - ${s.name}`,
                            course: s.course,
                        }))
                    );
                });
        }
    }, [isAddSubjectModalOpen]);

    const handleEdit = () => setIsEditModalOpen(true);

    const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, files} = e.target as HTMLInputElement;
        if (name === "profile_image" && files?.[0]) {
            setEditForm(prev => ({
                ...prev,
                profile_image: files[0],
                profile_image_preview: URL.createObjectURL(files[0]),
            }));
        } else {
            setEditForm(prev => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleEditSubmit = async () => {
        if (!student) return;
        try {
            let body: FormData | string;
            let headers: Record<string, string> = {};
            if (editForm.profile_image) {
                body = new FormData();
                body.append("student_id", editForm.student_id);
                body.append("first_name", editForm.first_name);
                body.append("middle_name", editForm.middle_name);
                body.append("last_name", editForm.last_name);
                body.append("email", editForm.email);
                body.append("date_of_birth", editForm.date_of_birth);
                body.append("course", editForm.course || "");
                body.append("year_level", editForm.year_level || "");
                body.append("section", editForm.section || "");
                body.append("profile_image", editForm.profile_image);
            } else {
                body = JSON.stringify({
                    student_id: editForm.student_id,
                    first_name: editForm.first_name,
                    middle_name: editForm.middle_name,
                    last_name: editForm.last_name,
                    email: editForm.email,
                    date_of_birth: editForm.date_of_birth,
                    course: editForm.course || null,
                    year_level: editForm.year_level || null,
                    section: editForm.section || null,
                });
                headers["Content-Type"] = "application/json";
            }
            const res = await fetch(`http://127.0.0.1:8000/api/students/${student.id}/`, {
                method: "PUT",
                headers,
                body,
            });
            if (!res.ok) {
                alert("Failed to update student.");
                return;
            }
            setIsEditModalOpen(false);
            await fetchStudent();
        } catch (e) {
            // handle error
            console.error("Failed to update student:", e);
        }
    };

    const handleDelete = () => setIsDeleteModalOpen(true);

    const handleConfirmDelete = () => {
        if (!student) return;
        fetch(`http://127.0.0.1:8000/api/students/${student.id}/`, {method: "DELETE"}).then(() =>
            navigate("/StudentsView")
        );
    };

    const handleAddSubject = () => setIsAddSubjectModalOpen(true);

    const handleEnrollSubjects = async () => {
        if (!student) return;
        setAddSubjectLoading(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/students/${student.id}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    subject: [
                        ...student.subject.map(s => s.id),
                        ...selectedSubjects.map(s => s.value).filter(
                            id => !student.subject.some(sub => String(sub.id) === String(id))
                        ),
                    ],
                }),
            });
            if (!response.ok) {
                alert("Failed to enroll subjects.");
                setAddSubjectLoading(false);
                return;
            }
            await fetchStudent();
            setSelectedSubjects([]);
            setIsAddSubjectModalOpen(false);
        } catch (e) {
            alert("Unable to load student data. Please try again later.");
            console.error("Failed to fetch student details:", e);
        } finally {
            setAddSubjectLoading(false);
        }
    };

    const filteredSubjectOptions = student?.course
        ? allSubjects.filter(
            s =>
                !student.subject.some(sub => String(sub.id) === String(s.value)) &&
                s.course === student.course?.id
        )
        : allSubjects.filter(s => !student?.subject.some(sub => String(sub.id) === String(s.value)));

    const animatedComponents = makeAnimated();

    if (loading) {
        return (
            <Navbar>
                <div
                    className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 w-full">
                    <motion.div
                        className="flex items-center justify-center"
                        initial={{scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{type: "spring", stiffness: 200, damping: 20}}
                    >
                        <motion.div
                            className="w-16 h-16 rounded-full border-4 border-violet-400 border-t-transparent animate-spin"
                            style={{borderTopColor: "#a78bfa"}}
                            animate={{rotate: 360}}
                            transition={{repeat: Infinity, duration: 1, ease: "linear"}}
                        />
                    </motion.div>
                    <motion.div
                        className="mt-6 text-xl font-bold text-violet-700"
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.2}}
                    >
                        Loading...
                    </motion.div>
                </div>
            </Navbar>
        );
    }

    if (!student) {
        return (
            <Navbar>
                <div
                    className="flex justify-center items-center min-h-screen bg-gradient-to-br from-violet-50 to-violet-100">
                    <span className="text-red-600 font-semibold">Student not found.</span>
                </div>
            </Navbar>
        );
    }

    return (
        <Navbar>
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 px-2">
                <motion.div
                    className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-4 sm:p-8 md:p-12 flex flex-col gap-8"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, type: "spring" }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center text-violet-600 hover:text-violet-800 transition p-2 rounded-full hover:bg-violet-100 focus:outline-none"
                                aria-label="Back"
                            >
                                <ArrowLeft className="w-5 h-5"/>
                            </button>
                            <span className="text-sm text-gray-500">Back to Students</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleEdit}
                                className="inline-flex items-center px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow transition"
                                aria-label="Edit"
                            >
                                <Pencil className="w-5 h-5 mr-2"/>
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition"
                                aria-label="Delete"
                            >
                                <Trash2 className="w-5 h-5 mr-2"/>
                                Delete
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        <div className="flex items-center gap-6 flex-1">
                            <div className="flex-shrink-0">
                                {(() => {
                                    let profileImageUrl = "https://ui-avatars.com/api/?name=" +
                                        encodeURIComponent(`${student.first_name} ${student.last_name}`) +
                                        "&background=7c3aed&color=fff&size=128";
                                    if (student.profile_image) {
                                        if (student.profile_image.startsWith("http")) {
                                            profileImageUrl = student.profile_image;
                                        } else {
                                            profileImageUrl = `http://127.0.0.1:8000${student.profile_image}`;
                                        }
                                    }
                                    return (
                                        <img
                                            src={profileImageUrl}
                                            alt="Profile"
                                            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-violet-200 shadow-md"
                                        />
                                    );
                                })()}
                            </div>
                            <div className="flex flex-col gap-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-violet-700 leading-tight break-words">
                                    {student.first_name}{" "}
                                    <span className="font-normal text-gray-700">{student.middle_name ?? ""}</span>{" "}
                                    {student.last_name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Student ID: <span className="font-mono">{student.student_id}</span>
                                </p>
                                <p className="text-sm text-gray-500 break-all">{student.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Date of Birth</span>
                                <span className="block font-medium text-gray-800">{student.date_of_birth}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Course</span>
                                <span className="block font-medium text-gray-800">{student.course?.name ?? "-"}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Year Level</span>
                                <span
                                    className="block font-medium text-gray-800">{student.year_level?.year ?? "-"}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-gray-400 mb-1">Section</span>
                                <span
                                    className="block font-medium text-gray-800">{student.section?.section ?? "-"}</span>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="block text-xs text-gray-400">Subjects Enrolled</span>
                                <button
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow transition"
                                    onClick={handleAddSubject}
                                >
                                    <Plus className="w-4 h-4"/>
                                    Add Subject
                                </button>
                            </div>
                            <ul className="space-y-2">
                                {student.subject.length > 0 ? (
                                    student.subject.map(subject => (
                                        <motion.li
                                            key={subject.id}
                                            className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-2 text-violet-800 font-medium shadow-sm"
                                            initial={{opacity: 0, x: 20}}
                                            animate={{opacity: 1, x: 0}}
                                            transition={{duration: 0.3, type: "spring"}}
                                        >
                                            <span className="font-semibold">{subject.code}</span>
                                            <span className="text-gray-400">-</span>
                                            <span>{subject.name}</span>
                                        </motion.li>
                                    ))
                                ) : (
                                    <li className="text-gray-400 italic">No subjects enrolled.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                    {/* Quiz Grades Section */}
                    <section className="w-full">
                        <div className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 p-0 sm:p-6 md:p-8 mt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                <h3 className="text-xl sm:text-2xl font-bold text-violet-700 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 17l4 4 4-4m0-5V3m-8 4h8" />
                                    </svg>
                                    Quiz Grades
                                </h3>
                                <span className="text-xs text-gray-500">
                                    Track and manage all quiz grades for this student.
                                </span>
                            </div>
                            {/* Responsive design: Card list on mobile, table on larger screens */}
                            <div className="w-full">
                                {/* Desktop/tablet view */}
                                <div className="hidden sm:block">
                                    <div className="rounded-lg bg-white shadow border border-gray-100 p-2 sm:p-4 overflow-x-auto">
                                        {student.id && <QuizGrades studentId={student.id} />}
                                    </div>
                                </div>
                                {/* Mobile view: Card layout */}
                                <div className="block sm:hidden">
                                    <div className="flex flex-col gap-4">
                                        {student.id && (
                                            <QuizGrades
                                                studentId={student.id}
                                                renderMode="cards"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Activity Grades Section */}
                    <section className="w-full">
                        <div className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 p-0 sm:p-6 md:p-8 mt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                <h3 className="text-xl sm:text-2xl font-bold text-violet-700 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17l3 3 3-3m0-5V4m-6 4h6" />
                                    </svg>
                                    Activity Grades
                                </h3>
                                <span className="text-xs text-gray-500">
                                    Track and manage all activity grades for this student.
                                </span>
                            </div>
                            <div className="w-full">
                                <div className="hidden sm:block">
                                    <div className="rounded-lg bg-white shadow border border-gray-100 p-2 sm:p-4 overflow-x-auto">
                                        {student.id && <ActivityGrades studentId={student.id} />}
                                    </div>
                                </div>
                                <div className="block sm:hidden">
                                    <div className="flex flex-col gap-4">
                                        {student.id && (
                                            <ActivityGrades
                                                studentId={student.id}
                                                renderMode="cards"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Exam Grades Section */}
                    <section className="w-full">
                        <div className="rounded-2xl shadow-lg bg-gradient-to-br from-purple-50 to-violet-100 p-0 sm:p-6 md:p-8 mt-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                <h3 className="text-xl sm:text-2xl font-bold text-violet-700 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Exam Grades
                                </h3>
                                <span className="text-xs text-gray-500">
                                    Track and manage all exam grades for this student.
                                </span>
                            </div>
                            <div className="w-full">
                                <div className="hidden sm:block">
                                    <div className="rounded-lg bg-white shadow border border-gray-100 p-2 sm:p-4 overflow-x-auto">
                                        {student.id && <ExamGrades studentId={student.id} />}
                                    </div>
                                </div>
                                <div className="block sm:hidden">
                                    <div className="flex flex-col gap-4">
                                        {student.id && (
                                            <ExamGrades
                                                studentId={student.id}
                                                renderMode="cards"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </motion.div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                message={`Are you sure you want to delete ${student.first_name} ${student.last_name}? This action cannot be undone.`}
            />
            <AnimatePresence>
                {isEditModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 flex flex-col gap-6"
                            initial={{scale: 0.95, y: 40}}
                            animate={{scale: 1, y: 0}}
                            exit={{scale: 0.95, y: 40}}
                            transition={{type: "spring", duration: 0.3}}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-xl font-bold text-violet-700">Edit Student</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-700 transition"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>
                            <form
                                className="flex flex-col gap-4"
                                onSubmit={async e => {
                                    e.preventDefault();
                                    await handleEditSubmit();
                                }}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <label htmlFor="profile_image" className="cursor-pointer">
                                        <img
                                            src={
                                                editForm.profile_image_preview ||
                                                "https://ui-avatars.com/api/?name=" +
                                                encodeURIComponent(
                                                    `${editForm.first_name} ${editForm.last_name}`
                                                ) +
                                                "&background=7c3aed&color=fff&size=128"
                                            }
                                            alt="Profile Preview"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-violet-200 shadow"
                                        />
                                        <input
                                            type="file"
                                            id="profile_image"
                                            name="profile_image"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleEditFormChange}
                                        />
                                        <span className="block text-xs text-gray-500 mt-1">Change Profile Picture</span>
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1" htmlFor="student_id">
                                            Student Number
                                        </label>
                                        <input
                                            type="text"
                                            id="student_id"
                                            name="student_id"
                                            value={editForm.student_id}
                                            onChange={handleEditFormChange}
                                            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                            placeholder="Student Number"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1" htmlFor="first_name">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            id="first_name"
                                            name="first_name"
                                            value={editForm.first_name}
                                            onChange={handleEditFormChange}
                                            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                            placeholder="First Name"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1" htmlFor="middle_name">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            id="middle_name"
                                            name="middle_name"
                                            value={editForm.middle_name}
                                            onChange={handleEditFormChange}
                                            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                            placeholder="Middle Name"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1" htmlFor="last_name">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            id="last_name"
                                            name="last_name"
                                            value={editForm.last_name}
                                            onChange={handleEditFormChange}
                                            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                            placeholder="Last Name"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col sm:col-span-2">
                                        <label className="text-xs text-gray-500 mb-1" htmlFor="email">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={editForm.email}
                                            onChange={handleEditFormChange}
                                            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                            placeholder="Email"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col sm:col-span-2">
                                        <label className="text-xs text-gray-500 mb-1" htmlFor="date_of_birth">
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            id="date_of_birth"
                                            name="date_of_birth"
                                            value={editForm.date_of_birth}
                                            onChange={handleEditFormChange}
                                            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                            required
                                        />
                                    </div>
                                    <div className="flex flex-col sm:col-span-2">
                                        <label className="text-xs text-gray-500 mb-1" htmlFor="course">
                                            Course
                                        </label>
                                        <select
                                            id="course"
                                            name="course"
                                            value={editForm.course}
                                            onChange={handleEditFormChange}
                                            className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-400"
                                            required
                                        >
                                            <option value="">Select course</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.id}>
                                                    {course.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 font-semibold transition"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {isAddSubjectModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-6"
                            initial={{scale: 0.95, y: 40}}
                            animate={{scale: 1, y: 0}}
                            exit={{scale: 0.95, y: 40}}
                            transition={{type: "spring", duration: 0.3}}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-bold text-violet-700">Enroll in Subjects</h2>
                                <button
                                    className="text-gray-400 hover:text-gray-700 transition"
                                    onClick={() => setIsAddSubjectModalOpen(false)}
                                >
                                    <span className="text-2xl">&times;</span>
                                </button>
                            </div>
                            <div>
                                <label
                                    htmlFor="select-subjects"
                                    className="block text-xs text-gray-500 mb-1"
                                >
                                    Select Subjects
                                </label>
                                <Select
                                    inputId="select-subjects"
                                    isMulti
                                    isSearchable
                                    options={filteredSubjectOptions}
                                    value={selectedSubjects}
                                    onChange={opts => setSelectedSubjects(opts as SubjectOption[])}
                                    classNamePrefix="react-select"
                                    placeholder="Select subjects..."
                                    components={animatedComponents}
                                />
                                <span className="text-xs text-gray-500">
                                    You can search and select multiple subjects.
                                </span>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                                    onClick={() => setIsAddSubjectModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-md bg-violet-600 text-white hover:bg-violet-700 font-semibold transition"
                                    onClick={handleEnrollSubjects}
                                    disabled={addSubjectLoading || selectedSubjects.length === 0}
                                >
                                    {addSubjectLoading ? "Enrolling..." : "Enroll"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Navbar>
    );
};