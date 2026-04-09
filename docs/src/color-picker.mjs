/**
 * Live color picker for myst-theme CSS custom properties.
 * Reads current values from the document via getComputedStyle, lets the user
 * override them by setting inline styles on <html>.
 */

const TOKENS = {
  Accent: [
    'primary',
    'primary-hover',
    'heading',
    'link',
    'link-hover',
    'link-underline',
    'active',
    'active-bg',
    'active-surface',
    'focus-ring',
    'focus-outline',
    'accent-surface',
    'accent-surface-border',
    'accent-surface-text',
  ],
  Neutral: [
    'bg',
    'bg-alt',
    'surface',
    'surface-hover',
    'text',
    'text-secondary',
    'text-tertiary',
    'border',
    'border-strong',
    'code-bg',
  ],
  Admonition: [
    'info', 'info-bg', 'info-text',
    'success', 'success-bg', 'success-text',
    'warning', 'warning-bg', 'warning-text',
    'danger', 'danger-bg', 'danger-text',
    'orange', 'orange-bg', 'orange-text',
    'purple', 'purple-bg', 'purple-text',
    'gray', 'gray-bg', 'gray-text',
  ],
};

function readVar(name) {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(`--myst-color-${name}`)
    .trim();
  // Color inputs need #rrggbb. If the var resolves to a name or rgb(), best-effort fallback.
  if (/^#[0-9a-f]{6}$/i.test(v)) return v;
  // Try resolving via a temporary element
  const probe = document.createElement('div');
  probe.style.color = v;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const m = rgb.match(/\d+/g);
  if (!m) return '#000000';
  return '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
}

function setVar(name, value) {
  document.documentElement.style.setProperty(`--myst-color-${name}`, value);
}

function clearVar(name) {
  document.documentElement.style.removeProperty(`--myst-color-${name}`);
}

function render({ el }) {
  el.classList.add('myst-color-picker');

  const header = document.createElement('div');
  header.className = 'cp-header';
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy CSS';
  copyBtn.className = 'cp-btn';

  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset all';
  resetBtn.className = 'cp-btn';

  header.appendChild(copyBtn);
  header.appendChild(resetBtn);
  el.appendChild(header);

  const inputs = []; // { name, input, hex }

  for (const [group, names] of Object.entries(TOKENS)) {
    const section = document.createElement('section');
    const h = document.createElement('h4');
    h.textContent = group;
    section.appendChild(h);
    const grid = document.createElement('div');
    grid.className = 'cp-grid';
    section.appendChild(grid);

    for (const name of names) {
      const row = document.createElement('label');
      row.className = 'cp-row';

      const input = document.createElement('input');
      input.type = 'color';
      input.value = readVar(name);

      const text = document.createElement('span');
      text.className = 'cp-name';
      text.textContent = `--myst-color-${name}`;

      input.addEventListener('input', () => setVar(name, input.value));

      row.appendChild(input);
      row.appendChild(text);
      grid.appendChild(row);
      inputs.push({ name, input });
    }

    el.appendChild(section);
  }

  copyBtn.addEventListener('click', () => {
    const lines = inputs.map(({ name, input }) => `  --myst-color-${name}: ${input.value};`);
    const isDark = document.documentElement.classList.contains('dark');
    const selector = isDark ? '.dark' : ':root';
    const css = `${selector} {\n${lines.join('\n')}\n}`;
    navigator.clipboard.writeText(css).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy CSS'; }, 1500);
    });
  });

  resetBtn.addEventListener('click', () => {
    for (const { name, input } of inputs) {
      clearVar(name);
      input.value = readVar(name);
    }
  });
}

export default { render };
