import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

export function useTheme() {
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        // Check localStorage or system preference
        const stored = localStorage.getItem('sentinel-theme') as Theme;
        const systemPrefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const initialTheme = stored || (systemPrefers ? 'dark' : 'light');
        setTheme(initialTheme);
        
        // Apply initial theme
        document.documentElement.classList.toggle('light', initialTheme === 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('sentinel-theme', newTheme);
        document.documentElement.classList.toggle('light', newTheme === 'light');
    };

    return { theme, toggleTheme };
}
