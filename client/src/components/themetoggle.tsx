import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  if (!toggleTheme) return null; // segurança caso switchable=false

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md border border-border hover:bg-muted transition"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-primary" />
      ) : (
        <Sun className="w-5 h-5 text-accent" />
      )}
    </button>
  );
}
