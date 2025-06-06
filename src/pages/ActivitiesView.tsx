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

type Activity = {
    id: string;
    subject: string;
    title: string;
    total_marks: number;
    description: string;
};

export const ActivitiesView = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
    const [activityToEdit, setActivityToEdit] = useState<Activity | null>(null);

    const [form, setForm] = useState({
        subject: "",
        title: "",
        total_marks: "",
        description: "",
    });

    const [editForm, setEditForm] = useState({
        subject: "",
        title: "",
        total_marks: "",
        description: "",
    });

    const fetchData = async () => {
        setLoading(true);
        const [activityRes, subjectRes] = await Promise.all([
            fetch("https://djsms.onrender.com/api/activities/"),
            fetch("https://djsms.onrender.com/api/subjects/"),
        ]);
        const activitiesData = await activityRes.json();
        const subjectsData = await subjectRes.json();
        setActivities(Array.isArray(activitiesData) ? activitiesData : activitiesData.results || []);
        setSubjects(Array.isArray(subjectsData) ? subjectsData : subjectsData.results || []);
        setLoading(false);
    };

    useEffect(() => {
        void fetchData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const payload: any = {};
        if (form.subject) payload.subject = form.subject;
        if (form.title) payload.title = form.title;
        if (form.total_marks !== "") payload.total_marks = Number(form.total_marks);
        if (form.description) payload.description = form.description;

        const res = await fetch("https://djsms.onrender.com/api/activities/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json();
            alert(
                "Failed to add activity. " +
                (err && typeof err === "object" ? JSON.stringify(err) : "")
            );
            return;
        }

        setIsAddModalOpen(false);
        setForm({ subject: "", title: "", total_marks: "", description: "" });
        await fetchData();
    };

    const handleEdit = (activity: Activity) => {
        setActivityToEdit(activity);
        setEditForm({
            subject: activity.subject,
            title: activity.title,
            total_marks: String(activity.total_marks),
            description: activity.description,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!activityToEdit) return;
        const payload: any = {};
        if (editForm.subject) payload.subject = editForm.subject;
        if (editForm.title) payload.title = editForm.title;
        if (editForm.total_marks !== "") payload.total_marks = Number(editForm.total_marks);
        if (editForm.description) payload.description = editForm.description;

        const res = await fetch(`https://djsms.onrender.com/api/activities/${activityToEdit.id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const err = await res.json();
            alert(
                "Failed to edit activity. " +
                (err && typeof err === "object" ? JSON.stringify(err) : "")
            );
            return;
        }

        setIsEditModalOpen(false);
        setActivityToEdit(null);
        await fetchData();
    };

    const confirmDelete = (activity: Activity) => {
        setActivityToDelete(activity);
    };

    const handleConfirmDelete = async () => {
        if (!activityToDelete) return;
        await fetch(`https://djsms.onrender.com/api/activities/${activityToDelete.id}/`, { method: "DELETE" });
        setActivityToDelete(null);
        await fetchData();
    };

    if (loading) {
        return <Loading text="Loading activities..." />;
    }

    return (
        <Navbar>
            <section className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-extrabold text-violet-700 tracking-tight">Activities</h1>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-gradient-to-r from-violet-600 to-purple-500 text-white px-6 py-2 rounded-xl shadow-lg hover:from-violet-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-violet-400 transition font-semibold text-base"
                    >
                        + Add Activity
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
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Description</th>
                                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            <AnimatePresence>
                                {activities.map((activity) => (
                                    <motion.tr
                                        key={activity.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        whileHover={{ scale: 1.01, backgroundColor: "#f3f4f6" }}
                                        transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                        tabIndex={0}
                                        className="focus:outline-none focus:ring-2 focus:ring-violet-400"
                                    >
                                        <td className="px-4 py-3">
                                            {subjects.find((s) => String(s.id) === String(activity.subject))?.name || activity.subject}
                                        </td>
                                        <td className="px-4 py-3">{activity.title}</td>
                                        <td className="px-4 py-3">{activity.total_marks}</td>
                                        <td className="px-4 py-3">{activity.description}</td>
                                        <td className="px-4 py-3 flex space-x-2 items-center">
                                            <button
                                                onClick={() => handleEdit(activity)}
                                                className="text-violet-600 hover:text-violet-800 focus:outline-none rounded-full p-2 transition"
                                                aria-label={`Edit ${activity.title}`}
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => confirmDelete(activity)}
                                                className="text-red-600 hover:text-red-800 focus:outline-none rounded-full p-2 transition"
                                                aria-label={`Delete ${activity.title}`}
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
                        {activities.map((activity) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-gradient-to-br from-violet-50 to-white rounded-xl shadow p-4 flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-lg font-bold text-violet-700">{activity.title}</div>
                                        <div className="text-xs text-gray-500 mb-1">
                                            {subjects.find((s) => String(s.id) === String(activity.subject))?.name || activity.subject}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Total Marks: {activity.total_marks}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {activity.description}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <button
                                            onClick={() => handleEdit(activity)}
                                            className="text-violet-600 hover:text-violet-800 focus:outline-none rounded-full p-2 transition"
                                            aria-label={`Edit ${activity.title}`}
                                        >
                                            <Pencil size={20} />
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(activity)}
                                            className="text-red-600 hover:text-red-800 focus:outline-none rounded-full p-2 transition"
                                            aria-label={`Delete ${activity.title}`}
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
                title="Add Activity"
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
                    placeholder="Activity Title"
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
                <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    className="border-2 border-violet-200 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
                />
            </AddModal>

            {/* Edit Modal */}
            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditSubmit}
                title="Edit Activity"
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
                        label: "Activity Title",
                        value: editForm.title,
                        onChange: handleEditChange,
                        placeholder: "Activity Title",
                    },
                    {
                        name: "total_marks",
                        label: "Total Marks",
                        value: editForm.total_marks,
                        onChange: handleEditChange,
                        placeholder: "Total Marks",
                        type: "number",
                    },
                    {
                        name: "description",
                        label: "Description",
                        value: editForm.description,
                        onChange: handleEditChange,
                        placeholder: "Description",
                        type: "textarea",
                    },
                ]}
            />

            <ConfirmationModal
                isOpen={!!activityToDelete}
                message={`Are you sure you want to delete "${activityToDelete?.title}"?`}
                onClose={() => setActivityToDelete(null)}
                onConfirm={handleConfirmDelete}
            />
        </Navbar>
    );
};
