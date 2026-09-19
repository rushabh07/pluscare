import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";
import { useTheme } from "../theme/ThemeContext";

const OPTIONS = [
  { value: "light",  label: "Light",  Icon: FiSun },
  { value: "system", label: "System", Icon: FiMonitor },
  { value: "dark",   label: "Dark",   Icon: FiMoon },
];

/** Segmented Light / System / Dark switch. Fits navbars & dashboard headers. */
export default function ThemeToggle({ compact = false }) {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      title="Color theme: Light / System / Dark"
      className="flex items-center p-1 rounded-xl border border-slate-300 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            aria-pressed={active}
            title={`${label} theme${value === "system" ? " (follows your device)" : ""}`}
            className={`p-2 rounded-lg text-sm transition-all cursor-pointer ${
              active
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Icon />
            {!compact && <span className="sr-only">{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
