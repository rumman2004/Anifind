import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, WifiOff, ServerCrash } from "lucide-react";
import Button from "./Button";

const ERROR_TYPES = {
  network: {
    icon: <WifiOff size={40} />,
    title: "Connection Error",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  server: {
    icon: <ServerCrash size={40} />,
    title: "Server Error",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  notFound: {
    icon: <AlertCircle size={40} />,
    title: "Not Found",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
  },
  default: {
    icon: <AlertCircle size={40} />,
    title: "Something went wrong",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

const ErrorMessage = ({
  message = "An unexpected error occurred. Please try again.",
  type = "default",
  onRetry,
  compact = false,
  className = "",
}) => {
  const config = ERROR_TYPES[type] || ERROR_TYPES.default;

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex items-center gap-2.5 px-4 py-3 rounded-xl border
          ${config.bg} ${config.border} ${className}
        `}
      >
        <AlertCircle size={16} className={config.color} />
        <p className={`text-sm ${config.color}`}>{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`ml-auto flex items-center gap-1 text-xs ${config.color} hover:opacity-80 transition-opacity`}
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}
    >
      {/* Icon */}
      <div
        className={`
          w-20 h-20 rounded-2xl flex items-center justify-center mb-5
          ${config.bg} border ${config.border} ${config.color}
        `}
      >
        {config.icon}
      </div>

      {/* Title */}
      <h3 className={`text-xl font-bold mb-2 ${config.color}`}>
        {config.title}
      </h3>

      {/* Message */}
      <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
        {message}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="md">
          <RefreshCw size={15} />
          Try Again
        </Button>
      )}

      {/* Help Text */}
      {type === "network" && (
        <p className="mt-4 text-slate-600 text-xs">
          Check your internet connection and try again.
        </p>
      )}
      {type === "server" && (
        <p className="mt-4 text-slate-600 text-xs">
          The server might be temporarily unavailable. Please wait a moment.
        </p>
      )}
    </motion.div>
  );
};

export default ErrorMessage;