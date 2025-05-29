import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar.tsx";
import { AddModal } from "../components/AddModal";
import { EditModal } from "../components/EditModal";
import { ConfirmationModal } from "../components/ConfirmationModal.tsx";
import { Pencil, Trash } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Loading } from "../components/Loading";

type Subject = {
    id: string;
    name: string;
    code: string;
};

type Quiz = {
    id: string;
    subject: string;
    title: string;
    total_marks: number;
};

export const QuizzesView = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);
    const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);

    const [form, setForm] = useState({
        subject: "",
        title: "",
        total_marks: "",
    });

    const [editForm, setEditForm] = useState({
        subject: "",
        title: "",
        total_marks: "",
    });

    const fetchData = async () => {
        setLoading(true);
        const [quizRes, subjectRes] = await Promise.all([
            fetch("http://127.0.0.1:8000/api/quizzes/"),
            fetch("http://127.0.0.1:8000/api/subjects/"),
        ]);
        const quizzesData = await quizRes.json();
        const subjectsData = await subjectRes.json();
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : quizzesData.results || []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : subjectsData.results || []);
        setLoading(false);
    };

    useEffect(() => {
        // Await fetchData to avoid ignored promise
        (async () => {
            await fetchData();
        })();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const payload: any = {};
        if (form.subject) payload.subject = form.subject;
        if (form.title) payload.title = form.title;
        if (form.total_marks !== "") payload.total_marks = Number(form.total_marks);

        const res = await fetch("http://127.0.0.1:8000/api/quizzes/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json();
            alert(
                "Failed to add quiz. " +
                (err && typeof err === "object" ? JSON.stringify(err) : "")
            );
            return;
        }

        setIsAddModalOpen(false);
        setForm({ subject: "", title: "", total_marks: "" });
        await fetchData();
    };

    const handleEdit = (quiz: Quiz) => {
        setQuizToEdit(quiz);
        setEditForm({
            subject: quiz.subject,
            title: quiz.title,
            total_marks: String(quiz.total_marks),
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!quizToEdit) return;
        const payload: any = {};
        if (editForm.subject) payload.subject = editForm.subject;
        if (editForm.title) payload.title = editForm.title;
        if (editForm.total_marks !== "") payload.total_marks = Number(editForm.total_marks);

        const res = await fetch(`http://127.0.0.1:8000/api/quizzes/${quizToEdit.id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json();
            alert(
                "Failed to edit quiz. " +
                (err && typeof err === "object" ? JSON.stringify(err) : "")
            );
            return;
        }

        setIsEditModalOpen(false);
        setQuizToEdit(null);
        await fetchData();
    };

    const confirmDelete = (quiz: Quiz) => {
        setQuizToDelete(quiz);
    };

    const handleConfirmDelete = async () => {
        if (!quizToDelete) return;
        await fetch(`http://127.0.0.1:8000/api/quizzes/${quizToDelete.id}/`, { method: "DELETE" });
        setQuizToDelete(null);
        await fetchData();
    };

    if (loading) {
        return <Loading text="Loading quizzes..." />;
    }

    return (
        <Navbar>
            <section className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-violet-700 tracking-tight">Quizzes</h1>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-6 py-2 rounded-xl shadow-lg hover:from-violet-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition font-semibold text-base"
                    >
                        + Add Quiz
                    </button>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block bg-white shadow-2xl rounded-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-violet-600 to-purple-500 text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Subject</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Total Marks</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            <AnimatePresence>
                                {quizzes.map((quiz) => (
                                    <motion.tr
                                        key={quiz.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "#f3f4f6" }}
                                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                        tabIndex={0}
                                        className="focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    >
                                        <td className="px-4 py-3">
                                            {subjects.find((s) => String(s.id) === String(quiz.subject))?.name || quiz.subject}
                                        </td>
                                        <td className="px-4 py-3">{quiz.title}</td>
                                        <td className="px-4 py-3">{quiz.total_marks}</td>
                                        <td className="px-4 py-3 flex space-x-2 items-center">
                                            <button
                                                onClick={() => handleEdit(quiz)}
                                                className="text-violet-600 hover:text-violet-800 focus:outline-none rounded-full p-2 transition"
                                                aria-label={`Edit ${quiz.title}`}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(quiz)}
                                                className="text-red-600 hover:text-red-800 focus:outline-none rounded-full p-2 transition"
                                                aria-label={`Delete ${quiz.title}`}
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
                        {quizzes.map((quiz) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow p-4 flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-lg font-bold text-violet-700">{quiz.title}</div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            {subjects.find((s) => String(s.id) === String(quiz.subject))?.name || quiz.subject}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Total Marks: {quiz.total_marks}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <button
                                            onClick={() => handleEdit(quiz)}
                                            className="text-violet-600 hover:text-violet-800 focus:outline-none rounded-full p-2 transition"
                                            aria-label={`Edit ${quiz.title}`}
                                        >
                                            <Pencil size={20} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(quiz)}
                                            className="text-red-600 hover:text-red-800 focus:outline-none rounded-full p-2 transition"
                                            aria-label={`Delete ${quiz.title}`}
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
                title="Add Quiz"
            >
                <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                    required
                >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                        </option>
                    ))}
                </select>
                <input
                    type="text"
                    name="title"
                    placeholder="Quiz Title"
                    value={form.title}
                    onChange={handleChange}
                    className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                    required
                />
                <input
                    type="number"
                    name="total_marks"
                    placeholder="Total Marks"
                    value={form.total_marks}
                    onChange={handleChange}
                    className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                    required
                />
            </AddModal>

            {/* Edit Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Edit Quiz"
                fields={[
                    {
                        name: "subject",
                        label: "Subject",
                        type: "select",
                        value: String(editForm.subject),
                        onChange: handleEditChange as any,
                        placeholder: "Select Subject",
                    },
                    {
                        name: "title",
                        label: "Quiz Title",
                        value: editForm.title,
                        onChange: handleEditChange,
                        placeholder: "Quiz Title",
                    },
                    {
                        name: "total_marks",
                        label: "Total Marks",
                        value: editForm.total_marks,
                        onChange: handleEditChange,
                        placeholder: "Total Marks",
                        type: "number",
                    },
                ]}
            />

            <ConfirmationModal
                isOpen={!!quizToDelete}
                message={`Are you sure you want to delete "${quizToDelete?.title}"?`}
                onClose={() => setQuizToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </Navbar>
    );
};
