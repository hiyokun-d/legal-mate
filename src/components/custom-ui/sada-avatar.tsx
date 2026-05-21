import { motion } from "framer-motion";

interface SadaAvatarProps {
  size?: "xs" | "sm" | "md" | "lg";
  pulse?: boolean;
  glow?: boolean;
}

const sizes = {
  xs: { outer: "w-5 h-5", text: "text-[8px]" },
  sm: { outer: "w-7 h-7", text: "text-[10px]" },
  md: { outer: "w-9 h-9", text: "text-xs" },
  lg: { outer: "w-12 h-12", text: "text-sm" },
};

export function SadaAvatar({ size = "sm", pulse = false, glow = false }: SadaAvatarProps) {
  const s = sizes[size];
  return (
    <motion.div
      className="relative shrink-0"
      animate={pulse ? { scale: [1, 1.06, 1] } : {}}
      transition={pulse ? { repeat: Infinity, duration: 2.4, ease: "easeInOut" } : {}}
    >
      {glow && (
        <div
          className={`absolute inset-0 rounded-full bg-emerald-400/40 blur-md ${s.outer}`}
          style={{ transform: "scale(1.5)" }}
        />
      )}
      <div
        className={`relative ${s.outer} rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-sm`}
      >
        <span className={`font-bold text-white ${s.text} select-none`}>S</span>
      </div>
    </motion.div>
  );
}
