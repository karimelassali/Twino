import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";





export const Typing = ({typer}) => {

    const colors = {
        darkBlue: "#001F3F",
        lightBlue: "#3DB7E4",
        midBlue: "#4A7AFF",
        purple: "#8A7CFF",
        lightPurple: "#BB86FC",
        darkMode: {
          bg: "#00152A",
          surface: "#002952",
          text: "#E1F5FE",
          bubbleBotBg: "#0A2A4D",
          bubbleUserBg: "#1B365D",
          buttonBg: "#144E8C",
          buttonHoverBg: "#1F6EC0",
          border: "#144E8C",
          subText: "#A3C4F3",
        },
        lightMode: {
          bg: "#F7FAFC",
          surface: "#FFFFFF",
          text: "#1E293B",
          bubbleBotBg: "#E3E8F1",
          bubbleUserBg: "#D1D9F6",
          buttonBg: "#3DB7E4",
          buttonHoverBg: "#5AB0F9",
          border: "#CBD5E1",
          subText: "#64748B",
        },
      };
  return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p 
              className="text-sm text-right font-medium"
              style={{ color: colors.lightBlue }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <span className="flex items-center justify-end gap-2">
                <Sparkles size={12} />
                {typer} is thinking...
                <span className="inline-flex">
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
                  >.</motion.span>
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.8 }}
                  >.</motion.span>
                </span>
              </span>
            </motion.p>
          </motion.div>
    );
};

export default Typing;