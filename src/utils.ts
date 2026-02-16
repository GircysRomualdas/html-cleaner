export async function copyToClipboard(
  text: string,
  button: HTMLButtonElement,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = "Copied!";
    showNotification("Successfully copied", "success");
    setTimeout(() => {
      button.textContent = originalText;
    }, 1500);
  } catch (err) {
    showNotification("Failed to copy", "error");
    console.error("Failed to copy:", err);
    button.textContent = "Failed";
  }
}

export function toggleTheme(btnTheme: HTMLButtonElement) {
  document.documentElement.classList.toggle("dark");
  const isDark = document.documentElement.classList.contains("dark");
  btnTheme.textContent = isDark ? "Light Mode" : "Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
  showNotification(`Theme set to ${isDark ? "dark" : "light"} mode`, "success");
}

export function loadTheme(btnTheme: HTMLButtonElement) {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark");
    if (btnTheme) btnTheme.textContent = "Light Mode";
  }
}

export function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T | null;
  if (!element) {
    showNotification(`Missing element: ${id}`, "error");
    throw new Error(`Missing element: ${id}`);
  }
  return element;
}

export function showNotification(
  message: string,
  type: "success" | "error" | "warning" = "success",
): void {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
