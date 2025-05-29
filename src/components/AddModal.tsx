import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type AddModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title: string;
    children: React.ReactNode;
};

export const AddModal: React.FC<AddModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    children,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 pointer-events-auto animate-fadeIn border border-gray-200 flex flex-col max-h-[90vh]"
                        initial={{ scale: 0.95, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <div className="flex items-center justify-between px-6 py-4 rounded-t-xl bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500">
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 rounded-full p-2 transition"
                                aria-label="Close"
                                type="button"
                            >
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <form
                            onSubmit={e => {
                                e.preventDefault();
                                onSubmit();
                            }}
                            noValidate
                            className="flex flex-col flex-1"
                        >
                            <div className="px-6 py-6 space-y-5 border-b border-gray-100 overflow-y-auto flex-1 scroll-smooth"
                                 style={{ maxHeight: "50vh" }}>
                                {React.Children.map(children, (child, idx) => (
                                    <div key={idx} className="flex flex-col gap-1">{child}</div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-end px-6 py-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full sm:w-auto border border-gray-300 rounded-lg px-6 py-2 font-medium text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-2 font-semibold transition"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
