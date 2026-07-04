/**
 * Live color picker for myst-theme CSS custom properties.
 * Discovers --myst-color-* tokens at runtime from the resolved computed
 * style of <html> (the browser has already applied :root/.dark and any
 * @layer cascade), groups them by token-name prefix, then lets the user
 * override values by setting inline styles on <html>.
 */

const PREFIX = '--myst-color-';

// Stable prefix → group label mapping. Tokens whose prefix isn't listed here
// fall into "Other". Order determines display order.
const GROUP_PREFIXES = [
  [['primary', 'accent', 'link', 'active', 'focus'], 'Accent'],
  [['bg', 'surface', 'text', 'prose', 'border', 'inverse', 'code', 'kbd'], 'Neutral'],
  [['info', 'success', 'tip', 'warning', 'danger'], 'Admonition'],
  [['theorem', 'example', 'proof'], 'Math'],
  [['error'], 'Error'],
];

function discoverTokens() {
  const found = new Set();
  for (const prop of getComputedStyle(document.documentElement)) {
    if (prop.startsWith(PREFIX)) found.add(prop.slice(PREFIX.length));
  }
  return found;
}

function groupTokens(tokens) {
  const groups = Object.fromEntries(GROUP_PREFIXES.map(([, label]) => [label, []]));
  groups['Other'] = [];

  for (const name of tokens) {
    let placed = false;
    for (const [prefixes, label] of GROUP_PREFIXES) {
      if (prefixes.some((p) => name === p || name.startsWith(p + '-'))) {
        groups[label].push(name);
        placed = true;
        break;
      }
    }
    if (!placed) groups['Other'].push(name);
  }

  // Remove empty groups
  return Object.fromEntries(Object.entries(groups).filter(([, v]) => v.length > 0));
}

function readVar(name) {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(`${PREFIX}${name}`)
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
  document.documentElement.style.setProperty(`${PREFIX}${name}`, value);
}

function clearVar(name) {
  document.documentElement.style.removeProperty(`${PREFIX}${name}`);
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

  const tokens = discoverTokens();
  const groups = groupTokens(tokens);
  const inputs = []; // { name, input }

  for (const [group, names] of Object.entries(groups)) {
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
      text.textContent = `${PREFIX}${name}`;
      input.addEventListener('input', () => setVar(name, input.value));
      row.appendChild(input);
      row.appendChild(text);
      grid.appendChild(row);
      inputs.push({ name, input });
    }

    el.appendChild(section);
  }

  copyBtn.addEventListener('click', () => {
    const lines = inputs.map(({ name, input }) => `  ${PREFIX}${name}: ${input.value};`);
    const isDark = document.documentElement.classList.contains('dark');
    const css = `${isDark ? '.dark' : ':root'} {\n${lines.join('\n')}\n}`;
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
