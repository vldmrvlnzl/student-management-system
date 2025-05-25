import { motion, AnimatePresence } from "framer-motion";

type LogoutModalProps = {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export const LogoutModal = ({ isOpen, onCancel, onConfirm }: LogoutModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-lg"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to log out?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
