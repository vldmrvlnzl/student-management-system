import React, { useEffect, useState } from "react";
import { Loading } from "./Loading";
import { AddModal } from "./AddModal";
import { EditModal } from "./EditModal";
import { Pencil } from "lucide-react";

type Subject = {
    id: number;
    code: string;
    name: string;
};

type Activity = {
    id: number;
    title: string;
    total_marks: number;
    subject?: number | Subject;
};

type ActivityResult = {
    id: number;
    score: number;
    graded_at: string;
    activity: Activity;
};

type Student = {
    id: number;
    name?: string;
};

interface ActivityGradesProps {
    studentId: string;
    renderMode?: "table" | "cards";
}

const AddGradeForm: React.FC<{
    activities: Activity[];
    addForm: { activity: string; score: string };
    setAddForm: React.Dispatch<React.SetStateAction<{ activity: string; score: string }>>;
    loading: boolean;
}> = ({ activities, addForm, setAddForm, loading }) => (
    <>
        <label className="text-xs text-gray-500 mb-1" htmlFor="activity">
            Activity
        </label>
        <select
            id="activity"
            name="activity"
            value={addForm.activity}
            onChange={e => setAddForm(f => ({ ...f, activity: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={loading}
        >
            <option value="">Select activity</option>
            {activities.map(a => (
                <option key={a.id} value={a.id}>
                    {`${a.title}${typeof a.subject === "object" ? ` (${a.subject.code})` : ""}`}
                </option>
            ))}
        </select>

        <label className="text-xs text-gray-500 mb-1 mt-2" htmlFor="score">
            Score
        </label>
        <input
            type="number"
            id="score"
            name="score"
            value={addForm.score}
            onChange={e => setAddForm(f => ({ ...f, score: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={loading}
        />
    </>
);

export const ActivityGrades: React.FC<ActivityGradesProps> = ({ studentId, renderMode = "table" }) => {
    const [results, setResults] = useState<ActivityResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ activity: "", score: "" });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState<{ id: number | null; score: string }>({ id: null, score: "" });

    const fetchSubjectDetails = async (subjectId: number | string) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/subjects/${subjectId}/`);
            if (!res.ok) return undefined;
            return await res.json();
        } catch {
            return undefined;
        }
    };

    const enrichResultsWithActivityAndSubjectDetails = async (results: any[]): Promise<ActivityResult[]> => {
        const activityIds = Array.from(new Set(results.map(r => r.activity)));
        const activityDetailsArr = await Promise.all(
            activityIds.map(id =>
                fetch(`http://127.0.0.1:8000/api/activities/${id}/`).then(res => res.json())
            )
        );
        const activityDetailsMap: Record<number, Activity> = {};
        activityIds.forEach((id, idx) => {
            activityDetailsMap[id] = activityDetailsArr[idx];
        });

        const subjectIds = Array.from(
            new Set(
                activityDetailsArr
                    .map(a => (typeof a.subject === "object" ? a.subject.id : a.subject))
                    .filter(Boolean)
            )
        );
        const subjectDetailsArr = await Promise.all(subjectIds.map(id => fetchSubjectDetails(id)));
        const subjectDetailsMap: Record<number | string, Subject> = {};
        subjectIds.forEach((id, idx) => {
            subjectDetailsMap[id] = subjectDetailsArr[idx];
        });

        return results.map(r => {
            const activity = activityDetailsMap[r.activity] || { id: r.activity, title: "Unknown", total_marks: 0 };
            const subjectId = typeof activity.subject === "object" ? activity.subject.id : activity.subject;
            return {
                ...r,
                activity: {
                    ...activity,
                    subject: subjectId ? subjectDetailsMap[subjectId] : undefined,
                },
            };
        });
    };

    const fetchAndSetActivityResults = async (studentId: string) => {
        const res = await fetch(`http://127.0.0.1:8000/api/activity-results/?student=${studentId}`);
        const data = await res.json();
        const rawResults = Array.isArray(data) ? data : data.results ?? [];
        const enriched = await enrichResultsWithActivityAndSubjectDetails(rawResults);
        setResults(enriched);
    };

    useEffect(() => {
        if (!studentId) return;
        setLoading(true);
        setError(null);
        fetch(`http://127.0.0.1:8000/api/students/${studentId}/`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch student");
                return res.json();
            })
            .then(studentData => {
                setStudent(studentData);
                return fetchAndSetActivityResults(studentData.id);
            })
            .catch(e => {
                setError(e.message ?? "Unknown error");
                console.error("ActivityGrades fetch error:", e);
            })
            .finally(() => setLoading(false));
    }, [studentId]);

    useEffect(() => {
        if (!isAddModalOpen) return;
        fetch("http://127.0.0.1:8000/api/activities/")
            .then(res => res.json())
            .then(async data => {
                let activityList = Array.isArray(data) ? data : data.results ?? [];
                activityList = await Promise.all(
                    activityList.map(async (activity: Activity) => {
                        const subjectId = typeof activity.subject === "object" ? activity.subject.id : activity.subject;
                        if (subjectId) {
                            const subject = await fetchSubjectDetails(subjectId);
                            return { ...activity, subject };
                        }
                        return activity;
                    })
                );
                setActivities(activityList);
            });
    }, [isAddModalOpen]);

    const handleAddGrade = async () => {
        if (!student || !addForm.activity || !addForm.score) return;
        try {
            setLoading(true);
            const res = await fetch("http://127.0.0.1:8000/api/activity-results/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student: student.id,
                    activity: addForm.activity,
                    score: addForm.score,
                    graded_at: new Date().toISOString(),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMsg = Object.entries(errorData)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                    .join("\n");
                alert(`Failed to add activity grade.\n${errorMsg}`);
                return;
            }

            setIsAddModalOpen(false);
            setAddForm({ activity: "", score: "" });
            await fetchAndSetActivityResults(student.id.toString());
        } catch (e) {
            alert("Failed to add activity grade.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (result: ActivityResult) => {
        setEditForm({ id: result.id, score: result.score.toString() });
        setIsEditModalOpen(true);
    };

    const handleEditGrade = async () => {
        if (!editForm.id || editForm.score === "") return;
        try {
            setLoading(true);
            const res = await fetch(`http://127.0.0.1:8000/api/activity-results/${editForm.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score: editForm.score }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMsg = Object.entries(errorData)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                    .join("\n");
                alert(`Failed to edit activity score.\n${errorMsg}`);
                return;
            }

            setIsEditModalOpen(false);
            setEditForm({ id: null, score: "" });
            await fetchAndSetActivityResults(student!.id.toString());
        } catch (e) {
            alert("Failed to edit activity score.");
        } finally {
            setLoading(false);
        }
    };

    const renderModals = (
        <>
            <AddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddGrade}
                title="Add Activity Grade"
            >
                <AddGradeForm
                    activities={activities}
                    addForm={addForm}
                    setAddForm={setAddForm}
                    loading={loading}
                />
            </AddModal>

            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditGrade}
                title="Edit Activity Score"
                fields={[
                    {
                        label: "Score",
                        name: "score",
                        type: "number",
                        value: editForm.score,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                            setEditForm(f => ({ ...f, score: e.target.value })),
                    },
                ]}
            />
        </>
    );

    if (loading) return <Loading text="Loading activity results..." />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    if (!results.length) {
        return (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <span>No activity results found.</span>
                    <button
                        className="px-3 py-1.5 rounded bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add Grade
                    </button>
                </div>
                {renderModals}
            </div>
        );
    }

    if (renderMode === "cards") {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-end mb-2">
                    <button
                        className="px-3 py-1.5 rounded bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add Grade
                    </button>
                </div>

                {results.map(result => (
                    <div
                        key={result.id}
                        className="rounded-xl bg-white shadow border border-gray-100 p-4 flex flex-col gap-2"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-violet-700 text-base">
                                {result.activity.title}
                            </span>
                            <span className="text-xs text-gray-400">
                                {(result.activity.subject as Subject)?.code ?? "N/A"}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm mt-1">
                            <div className="flex-1">
                                <span className="text-gray-500">Score: </span>
                                <span className="font-semibold">{result.score}</span>
                                <span className="text-gray-400"> / {result.activity.total_marks}</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-gray-500">Graded: </span>
                                <span className="font-semibold">
                                    {new Date(result.graded_at).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {(result.activity.subject as Subject)?.name && (
                                <>
                                    Subject:{" "}
                                    <span className="font-medium">
                                        {(result.activity.subject as Subject).name}
                                    </span>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-2 py-1 rounded text-violet-600 hover:text-violet-800 transition flex items-center"
                                onClick={() => handleEditClick(result)}
                                title="Edit Score"
                            >
                                <Pencil size={16} />
                            </button>
                        </div>
                    </div>
                ))}

                {renderModals}
            </div>
        );
    }

    // Table layout
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Activity Results</h2>
                <button
                    className="px-3 py-1.5 rounded bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Add Grade
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full border text-sm rounded-lg overflow-hidden">
                    <thead className="bg-violet-50">
                        <tr>
                            <th className="border px-2 py-2">Subject Code</th>
                            <th className="border px-2 py-2">Activity Title</th>
                            <th className="border px-2 py-2">Score</th>
                            <th className="border px-2 py-2">Total Marks</th>
                            <th className="border px-2 py-2">Graded At</th>
                            <th className="border px-2 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(result => (
                            <tr key={result.id}>
                                <td className="border px-2 py-2">
                                    {(result.activity.subject as Subject)?.code ?? "N/A"}
                                </td>
                                <td className="border px-2 py-2">{result.activity.title}</td>
                                <td className="border px-2 py-2">{result.score}</td>
                                <td className="border px-2 py-2">{result.activity.total_marks}</td>
                                <td className="border px-2 py-2">
                                    {new Date(result.graded_at).toLocaleString()}
                                </td>
                                <td className="border px-2 py-2">
                                    <button
                                        className="px-2 py-1 rounded text-violet-600 hover:text-violet-800 transition flex items-center"
                                        onClick={() => handleEditClick(result)}
                                        title="Edit Score"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {renderModals}
        </div>
    );
};
