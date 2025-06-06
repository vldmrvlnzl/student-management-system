import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../components/Navbar.tsx";
import { AddModal } from "../components/AddModal.tsx";
import { EditModal } from "../components/EditModal";
import { ConfirmationModal } from "../components/ConfirmationModal.tsx";
import { Pencil, Trash } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Loading } from "../components/Loading";

type Course = {
    id: number;
    name: string;
};

type Subject = {
    id: number;
    course: Course | number | null;
    name: string;
    code: string;
    created_at: string;
};

export const SubjectsView = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState<{
        course: number | "";
        name: string;
        code: string;
    }>({
        course: "",
        name: "",
        code: "",
    });

    const [editFormData, setEditFormData] = useState<{
        course: number | "";
        name: string;
        code: string;
    }>({
        course: "",
        name: "",
        code: "",
    });

    const [courses, setCourses] = useState<Course[]>([]);

    // Fetch subjects and expand course references
    const fetchSubject = async () => {
        try {
            const response = await axios.get("https://djsms.onrender.com/api/subjects/");
            const subjectsRaw: Subject[] = response.data;

            // Fetch all courses for mapping
            const coursesRes = await axios.get("https://djsms.onrender.com/api/courses/");
            const coursesMap = new Map<number, Course>();
            coursesRes.data.forEach((c: Course) => coursesMap.set(c.id, c));

            // Map course ids to objects
            const subjectsWithRefs = subjectsRaw.map((subject) => ({
                ...subject,
                course: typeof subject.course === "number" ? coursesMap.get(subject.course) || null : subject.course,
            }));

            setSubjects(subjectsWithRefs);
            setCourses(coursesRes.data); // Ensure courses state is set
        } catch (error) {
            console.error("Error fetching subjects or courses:", error);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchSubject().finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "course" ? Number(value) : value });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: name === "course" ? Number(value) : value });
    };

    const handleSubmit = () => {
        axios
            .post("https://djsms.onrender.com/api/subjects/", formData)
            .then(() => {
                fetchSubject();
                setIsAddModalOpen(false);
                setFormData({
                    course: "",
                    name: "",
                    code: "",
                });
            })
            .catch((error) => console.error("Error adding subject:", error));
    };

    const handleEditSubmit = () => {
        if (!subjectToEdit) return;
        axios
            .put(`https://djsms.onrender.com/api/subjects/${subjectToEdit.id}/`, editFormData)
            .then(() => {
                fetchSubject();
                setIsEditModalOpen(false);
                setSubjectToEdit(null);
            })
            .catch((error) => console.error("Error editing subject:", error));
    };

    const confirmDelete = (subject: Subject) => {
        setSubjectToDelete(subject);
    };

    const handleConfirmDelete = () => {
        if (!subjectToDelete) return;
        axios
            .delete(`https://djsms.onrender.com/api/subjects/${subjectToDelete.id}/`)
            .then(() => {
                fetchSubject();
                setSubjectToDelete(null);
            })
            .catch((error) => {
                console.error("Error deleting subject:", error);
                setSubjectToDelete(null);
            });
    };

    const handleEdit = (subject: Subject) => {
        setSubjectToEdit(subject);
        setEditFormData({
            course: typeof subject.course === "object" && subject.course ? subject.course.id : "",
            name: subject.name,
            code: subject.code,
        });
        setIsEditModalOpen(true);
    };

    if (loading) {
        return <Loading text="Loading subjects..." />;
    }

    // Responsive: use cards on mobile, table on desktop
    return (
        <Navbar>
            <section className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-violet-700 tracking-tight">Subjects</h1>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-6 py-2 rounded-xl shadow-lg hover:from-violet-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition font-semibold text-base"
                    >
                        + Add Subject
                    </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-violet-600 to-purple-500 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Course</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Code</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Created At</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            <AnimatePresence>
                                {subjects.map((subject) => (
                                    <motion.tr
                                        key={subject.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "#f3f4f6" }}
                                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                        tabIndex={0}
                                        className="focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    >
                                        <td className="px-4 py-3">{typeof subject.course === "object" && subject.course ? subject.course.name : "-"}</td>
                                        <td className="px-4 py-3">{subject.name}</td>
                                        <td className="px-4 py-3">{subject.code}</td>
                                        <td className="px-4 py-3">{new Date(subject.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 flex space-x-2 items-center">
                                            <button
                                                onClick={() => handleEdit(subject)}
                                                className="text-violet-600 hover:text-violet-800 focus:outline-none rounded-full p-2 transition"
                                                aria-label={`Edit ${subject.name}`}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(subject)}
                                                className="text-red-600 hover:text-red-800 focus:outline-none rounded-full p-2 transition"
                                                aria-label={`Delete ${subject.name}`}
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden flex flex-col gap-4 p-2">
                    <AnimatePresence>
                        {subjects.map((subject) => (
                            <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow p-4 flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-lg font-bold text-violet-700">{subject.name}</div>
                                        <div className="text-xs text-gray-500 mb-1">{subject.code}</div>
                                        <div className="text-xs text-gray-400">
                                            Course: {typeof subject.course === "object" && subject.course ? subject.course.name : "-"}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Created: {new Date(subject.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <button
                                            onClick={() => handleEdit(subject)}
                                            className="text-violet-600 hover:text-violet-800 focus:outline-none rounded-full p-2 transition"
                                            aria-label={`Edit ${subject.name}`}
                                        >
                                            <Pencil size={20} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(subject)}
                                            className="text-red-600 hover:text-red-800 focus:outline-none rounded-full p-2 transition"
                                            aria-label={`Delete ${subject.name}`}
                                        >
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </section>

            {/* Add Modal */}
            <AddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleSubmit}
                title="Add Subject"
            >
                <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                >
                    <option value="">Select Course</option>
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    name="name"
                    placeholder="Subject Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                />
                <input
                    type="text"
                    name="code"
                    placeholder="Subject Code"
                    value={formData.code}
                    onChange={handleChange}
                    className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                />
            </AddModal>

            {/* Edit Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Edit Subject"
                fields={[
                    {
                        name: "course",
                        label: "Course",
                        type: "select",
                        value: String(editFormData.course),
                        onChange: handleEditChange as any,
                        placeholder: "Select Course",
                    },
                    {
                        name: "name",
                        label: "Subject Name",
                        value: editFormData.name,
                        onChange: handleEditChange,
                        placeholder: "Subject Name",
                    },
                    {
                        name: "code",
                        label: "Subject Code",
                        value: editFormData.code,
                        onChange: handleEditChange,
                        placeholder: "Subject Code",
                    },
                ]}
                // No 'render' property, only known EditField properties
            />

            <ConfirmationModal
                isOpen={!!subjectToDelete}
                message={`Are you sure you want to delete ${subjectToDelete?.name} ${subjectToDelete?.code}?`}
                onClose={() => setSubjectToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </Navbar>
    );
};
