/**
 * Toggle the example fonts from the Styling page on and off.
 * Adds the example CSS to the page and removes it when the page unloads.
 */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lora&family=Oswald&family=Space+Mono&display=swap');

:root {
  --myst-font-body: 'Lora', serif;
  --myst-font-heading: 'Oswald', sans-serif;
  --myst-font-mono: 'Space Mono', monospace;
}
`;

function render({ el }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  const reset = () => style.remove();

  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.onchange = () => (checkbox.checked ? document.head.appendChild(style) : reset());
  label.append(checkbox, ' Preview these fonts on this page');
  el.appendChild(label);
  return reset;
}

export default { render };
