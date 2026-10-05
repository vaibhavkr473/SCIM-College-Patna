import { useTheme } from '@/lib/theme.jsx';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <span className="theme-toggle-knob">
        <i className="bi bi-sun-fill icon-sun"></i>
        <i className="bi bi-moon-stars-fill icon-moon"></i>
      </span>
    </button>
  );
}
