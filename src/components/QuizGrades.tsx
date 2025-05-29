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

type Quiz = {
    id: number;
    title: string;
    total_marks: number;
    subject?: number | Subject;
};

type QuizResult = {
    id: number;
    score: number;
    graded_at: string;
    quiz: Quiz;
};

type Student = {
    id: number;
    name?: string;
};

interface QuizGradesProps {
    studentId: string;
    renderMode?: "table" | "cards";
}

const AddGradeForm: React.FC<{
    quizzes: Quiz[];
    addForm: { quiz: string; score: string };
    setAddForm: React.Dispatch<React.SetStateAction<{ quiz: string; score: string }>>;
    loading: boolean;
}> = ({ quizzes, addForm, setAddForm, loading }) => (
    <>
        <label className="text-xs text-gray-500 mb-1" htmlFor="quiz">
            Quiz
        </label>
        <select
            id="quiz"
            name="quiz"
            value={addForm.quiz}
            onChange={e => setAddForm(f => ({ ...f, quiz: e.target.value }))}
            className="rounded-md border border-gray-300 px-3 py-2"
            required
            disabled={loading}
        >
            <option value="">Select quiz</option>
            {quizzes.map(q => (
                <option key={q.id} value={q.id}>
                    {`${q.title}${typeof q.subject === "object" ? ` (${q.subject.code})` : ""}`}
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

export const QuizGrades: React.FC<QuizGradesProps> = ({ studentId, renderMode = "table" }) => {
    const [results, setResults] = useState<QuizResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ quiz: "", score: "" });

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

    const enrichResultsWithQuizAndSubjectDetails = async (results: any[]): Promise<QuizResult[]> => {
        const quizIds = Array.from(new Set(results.map(r => r.quiz)));
        const quizDetailsArr = await Promise.all(
            quizIds.map(id =>
                fetch(`http://127.0.0.1:8000/api/quizzes/${id}/`).then(res => res.json())
            )
        );
        const quizDetailsMap: Record<number, Quiz> = {};
        quizIds.forEach((id, idx) => {
            quizDetailsMap[id] = quizDetailsArr[idx];
        });

        const subjectIds = Array.from(
            new Set(
                quizDetailsArr
                    .map(q => (typeof q.subject === "object" ? q.subject.id : q.subject))
                    .filter(Boolean)
            )
        );
        const subjectDetailsArr = await Promise.all(subjectIds.map(id => fetchSubjectDetails(id)));
        const subjectDetailsMap: Record<number | string, Subject> = {};
        subjectIds.forEach((id, idx) => {
            subjectDetailsMap[id] = subjectDetailsArr[idx];
        });

        return results.map(r => {
            const quiz = quizDetailsMap[r.quiz] || { id: r.quiz, title: "Unknown", total_marks: 0 };
            const subjectId = typeof quiz.subject === "object" ? quiz.subject.id : quiz.subject;
            return {
                ...r,
                quiz: {
                    ...quiz,
                    subject: subjectId ? subjectDetailsMap[subjectId] : undefined,
                },
            };
        });
    };

    const fetchAndSetQuizResults = async (studentId: string) => {
        const res = await fetch(`http://127.0.0.1:8000/api/quiz-results/?student=${studentId}`);
        const data = await res.json();
        const rawResults = Array.isArray(data) ? data : data.results ?? [];
        const enriched = await enrichResultsWithQuizAndSubjectDetails(rawResults);
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
                return fetchAndSetQuizResults(studentData.id);
            })
            .catch(e => {
                setError(e.message ?? "Unknown error");
                console.error("QuizGrades fetch error:", e);
            })
            .finally(() => setLoading(false));
    }, [studentId]);

    useEffect(() => {
        if (!isAddModalOpen) return;
        fetch("http://127.0.0.1:8000/api/quizzes/")
            .then(res => res.json())
            .then(async data => {
                let quizList = Array.isArray(data) ? data : data.results ?? [];
                quizList = await Promise.all(
                    quizList.map(async (quiz: Quiz) => {
                        const subjectId = typeof quiz.subject === "object" ? quiz.subject.id : quiz.subject;
                        if (subjectId) {
                            const subject = await fetchSubjectDetails(subjectId);
                            return { ...quiz, subject };
                        }
                        return quiz;
                    })
                );
                setQuizzes(quizList);
            });
    }, [isAddModalOpen]);

    const handleAddGrade = async () => {
        if (!student || !addForm.quiz || !addForm.score) return;
        try {
            setLoading(true);
            const res = await fetch("http://127.0.0.1:8000/api/quiz-results/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    student: student.id,
                    quiz: addForm.quiz,
                    score: addForm.score,
                    graded_at: new Date().toISOString(),
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMsg = Object.entries(errorData)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                    .join("\n");
                alert(`Failed to add quiz grade.\n${errorMsg}`);
                return;
            }

            setIsAddModalOpen(false);
            setAddForm({ quiz: "", score: "" });
            await fetchAndSetQuizResults(student.id.toString());
        } catch (e) {
            alert("Failed to add quiz grade.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (result: QuizResult) => {
        setEditForm({ id: result.id, score: result.score.toString() });
        setIsEditModalOpen(true);
    };

    const handleEditGrade = async () => {
        if (!editForm.id || editForm.score === "") return;
        try {
            setLoading(true);
            const res = await fetch(`http://127.0.0.1:8000/api/quiz-results/${editForm.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ score: editForm.score }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const errorMsg = Object.entries(errorData)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                    .join("\n");
                alert(`Failed to edit quiz score.\n${errorMsg}`);
                return;
            }

            setIsEditModalOpen(false);
            setEditForm({ id: null, score: "" });
            await fetchAndSetQuizResults(student!.id.toString());
        } catch (e) {
            alert("Failed to edit quiz score.");
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
                title="Add Quiz Grade"
            >
                <AddGradeForm
                    quizzes={quizzes}
                    addForm={addForm}
                    setAddForm={setAddForm}
                    loading={loading}
                />
            </AddModal>

            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditGrade}
                title="Edit Quiz Score"
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

    if (loading) return <Loading text="Loading quiz results..." />;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    if (!results.length) {
        return (
            <div>
                <div className="flex justify-between items-center mb-2">
                    <span>No quiz results found.</span>
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
                {result.quiz.title}
              </span>
                            <span className="text-xs text-gray-400">
                {(result.quiz.subject as Subject)?.code ?? "N/A"}
              </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm mt-1">
                            <div className="flex-1">
                                <span className="text-gray-500">Score: </span>
                                <span className="font-semibold">{result.score}</span>
                                <span className="text-gray-400"> / {result.quiz.total_marks}</span>
                            </div>
                            <div className="flex-1">
                                <span className="text-gray-500">Graded: </span>
                                <span className="font-semibold">
                  {new Date(result.graded_at).toLocaleString()}
                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {(result.quiz.subject as Subject)?.name && (
                                <>
                                    Subject:{" "}
                                    <span className="font-medium">
                    {(result.quiz.subject as Subject).name}
                  </span>
                                </>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="px-2 py-1 rounded text-violet-600 hover:text-violet-800 transition flex items-center"
                                onClick={() => handleEditClick(result)}
                                title="Edit Total Marks"
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
                <h2 className="text-lg font-semibold">Quiz Results</h2>
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
                        <th className="border px-2 py-2">Quiz Title</th>
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
                                {(result.quiz.subject as Subject)?.code ?? "N/A"}
                            </td>
                            <td className="border px-2 py-2">{result.quiz.title}</td>
                            <td className="border px-2 py-2">{result.score}</td>
                            <td className="border px-2 py-2">{result.quiz.total_marks}</td>
                            <td className="border px-2 py-2">
                                {new Date(result.graded_at).toLocaleString()}
                            </td>
                            <td className="border px-2 py-2">
                                <button
                                    className="px-2 py-1 rounded text-violet-600 hover:text-violet-800 transition flex items-center"
                                    onClick={() => handleEditClick(result)}
                                    title="Edit Total Marks"
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
