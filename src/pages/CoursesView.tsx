import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navbar } from "../components/Navbar.tsx";
import { EditModal } from "../components/EditModal";
import { ConfirmationModal } from "../components/ConfirmationModal.tsx";
import { Trash, Pencil } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Loading } from "../components/Loading";

type Course = {
    id: number;
    name: string;
    code: string;
};

export const CoursesView = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const [formData, setFormData] = useState<Omit<Course, "id">>({
        name: "",
        code: "",
    });

    const [editFormData, setEditFormData] = useState<Omit<Course, "id">>({
        name: "",
        code: "",
    });

    const [loading, setLoading] = useState(true);

    const fetchCourses = () => {
        return axios
            .get("http://127.0.0.1:8000/api/courses/")
            .then((response) => {
                setCourses(Array.isArray(response.data) ? response.data : response.data.results ?? []);
            })
            .catch((error) => console.error("Error fetching courses:", error));
    };

    useEffect(() => {
        setLoading(true);
        fetchCourses().finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value,
        });
    };

    const handleSubmit = () => {
        axios
            .post("http://127.0.0.1:8000/api/courses/", formData)
            .then(() => {
                fetchCourses();
                setIsModalOpen(false);
                setFormData({ name: "", code: "" });
            })
            .catch((error) => console.error("Error adding course:", error));
    };

    const openEditModal = (course: Course) => {
        setEditingCourse(course);
        setEditFormData({ name: course.name, code: course.code });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = () => {
        if (!editingCourse) return;
        axios
            .put(`http://127.0.0.1:8000/api/courses/${editingCourse.id}/`, editFormData)
            .then(() => {
                fetchCourses();
                setIsEditModalOpen(false);
                setEditingCourse(null);
            })
            .catch((error) => console.error("Error editing course:", error));
    };

    const confirmDelete = (course: Course) => {
        setCourseToDelete(course);
    };

    const handleConfirmDelete = () => {
        if (!courseToDelete) return;
        axios
            .delete(`http://127.0.0.1:8000/api/courses/${courseToDelete.id}/`)
            .then(() => {
                fetchCourses();
                setCourseToDelete(null);
            })
            .catch((error) => {
                console.error("Error deleting course:", error);
                setCourseToDelete(null);
            });
    };

    if (loading) {
        return <Loading text="Loading courses..." />;
    }

    return (
        <Navbar>
            <section className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-violet-700 tracking-tight">Courses</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-6 py-2 rounded-xl shadow-lg hover:from-violet-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition font-semibold text-base"
                    >
                        + Add Course
                    </button>
                </div>
                {/* Responsive Table/Card */}
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-violet-600 to-purple-500 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Code</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                <AnimatePresence>
                                    {courses.map((course) => (
                                        <motion.tr
                                            key={course.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            whileHover={{ scale: 1.01, backgroundColor: "#f3f4f6" }}
                                            transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                            tabIndex={0}
                                            className="focus:outline-none focus:ring-2 focus:ring-violet-400"
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-900">{course.name}</td>
                                            <td className="px-4 py-3 text-gray-700">{course.code}</td>
                                            <td className="px-4 py-3 flex space-x-2 items-center">
                                                <button
                                                    onClick={() => openEditModal(course)}
                                                    className="text-violet-600 hover:text-violet-800 focus:outline-none rounded-full p-2 transition"
                                                    aria-label={`Edit ${course.name}`}
                                                >
                                                    <Pencil size={20} />
                                                </button>
                                                <button
                                                    onClick={() => confirmDelete(course)}
                                                    className="text-red-600 hover:text-red-800 focus:outline-none rounded-full p-2 transition"
                                                    aria-label={`Delete ${course.name}`}
                                                >
                                                    <Trash size={20} />
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
                            {courses.map((course) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow p-4 flex flex-col gap-2"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-lg font-bold text-violet-700">{course.name}</div>
                                            <div className="text-sm text-gray-500">{course.code}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal(course)}
                                                className="text-violet-600 hover:text-violet-800 focus:outline-none rounded-full p-2 transition"
                                                aria-label={`Edit ${course.name}`}
                                            >
                                                <Pencil size={20} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(course)}
                                                className="text-red-600 hover:text-red-800 focus:outline-none rounded-full p-2 transition"
                                                aria-label={`Delete ${course.name}`}
                                            >
                                                <Trash size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
            {/* Add Course Modal */}
            <EditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                title="Add Course"
                fields={[
                    {
                        name: "name",
                        label: "Course Name",
                        value: formData.name,
                        onChange: handleChange,
                        placeholder: "Course Name",
                    },
                    {
                        name: "code",
                        label: "Course Code",
                        value: formData.code,
                        onChange: handleChange,
                        placeholder: "Course Code",
                    },
                ]}
            />
            {/* Edit Course Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Edit Course"
                fields={[
                    {
                        name: "name",
                        label: "Course Name",
                        value: editFormData.name,
                        onChange: handleEditChange,
                        placeholder: "Course Name",
                    },
                    {
                        name: "code",
                        label: "Course Code",
                        value: editFormData.code,
                        onChange: handleEditChange,
                        placeholder: "Course Code",
                    },
                ]}
            />
            <ConfirmationModal
                isOpen={!!courseToDelete}
                message={`Are you sure you want to delete ${courseToDelete?.name}?`}
                onClose={() => setCourseToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </Navbar>
    );
};
