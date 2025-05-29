import { X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    message: string;
};

export const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    message,
}: ConfirmationModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 flex flex-col gap-6 animate-fadeIn"
                        initial={{ scale: 0.95, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                            aria-label="Close"
                        >
                            <X size={22} />
                        </button>
                        <div className="flex flex-col items-center text-center gap-2">
                            <span className="bg-red-100 rounded-full p-3 mb-2">
                                <AlertTriangle className="text-red-500" size={32} />
                            </span>
                            <h2 className="text-xl font-bold text-gray-800">Are you sure?</h2>
                            <p className="text-gray-600 text-base">{message}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition w-full sm:w-auto"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
