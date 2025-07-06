import { writable } from "svelte/store";

export const theme = writable("light");

if (typeof window !== "undefined") {
  const savedTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  theme.subscribe((currentTheme) => {
    document.body.style.backgroundColor =
      currentTheme === "light" ? "#ffffff" : "#1A2E3C";
    localStorage.setItem("theme", currentTheme);
  });

  theme.subscribe((currentTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--tooltip-bg', currentTheme === 'light' ? 'rgba(255, 255, 255)' : 'rgba(28, 37, 48, 0.97)');
    root.style.setProperty('--tooltip-text', currentTheme === 'light' ? '#2d4050' : '#d1e0eb');
    root.style.setProperty('--article-card-bg', currentTheme === 'light' ? '#f8fafc' : '#1a2633');
    root.style.setProperty('--article-card-border', currentTheme === 'light' ? '#e2e8f0' : '#2d4050');
    document.body.style.backgroundColor = currentTheme === "light" ? "#ffffff" : "#1A2E3C";
  });

  theme.set(savedTheme);
}
