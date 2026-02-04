import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'dark' ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-gray-800" />}
        </button>
    );
}
