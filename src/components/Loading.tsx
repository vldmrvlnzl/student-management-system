import { motion } from "framer-motion";

type LoadingProps = {
    text?: string;
};

export const Loading = ({ text = "Loading..." }: LoadingProps) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 w-full">
        <motion.div
            className="flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
            <motion.div
                className="w-16 h-16 rounded-full border-4 border-violet-400 border-t-transparent animate-spin"
                style={{ borderTopColor: "#a78bfa" }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
        </motion.div>
        <motion.div
            className="mt-6 text-xl font-bold text-violet-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            {text}
        </motion.div>
    </div>
);
