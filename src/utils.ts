export async function copyToClipboard(
  text: string,
  button: HTMLButtonElement,
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = originalText;
    }, 1500);
  } catch (err) {
    console.error("Failed to copy:", err);
    button.textContent = "Failed";
  }
}
