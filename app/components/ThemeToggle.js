'use client';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { C } from '../lib/colors';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setIsDark(true);
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      title="Toggle Theme"
      style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        backgroundColor: C.card2,
        border: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
    >
      {isDark ? <Sun size={18} color={C.muted2} /> : <Moon size={18} color={C.muted2} />}
    </button>
  );
}
