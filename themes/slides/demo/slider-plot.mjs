/**
 * A slider that sets the frequency of a sine curve, drawn as SVG.
 *
 * Model keys: `frequency` (initial value), `min`, `max`.
 */
const W = 900;
const H = 200;
const PAD = 30;
const N = 400;

function curve(frequency) {
  const points = [];
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * 2 * Math.PI;
    const y = Math.sin(frequency * x);
    points.push(`${PAD + (i / N) * (W - 2 * PAD)},${H / 2 - y * (H / 2 - PAD)}`);
  }
  return points.join(' ');
}

function render({ model, el }) {
  const min = model.get('min') ?? 0.5;
  const max = model.get('max') ?? 8;

  el.innerHTML = `
    <div style="font-size: 0.75em">
      <svg viewBox="0 0 ${W} ${H}" style="width: 100%; height: auto">
        <line x1="${PAD}" x2="${W - PAD}" y1="${H / 2}" y2="${H / 2}"
              stroke="var(--myst-color-border-strong)" stroke-width="2" />
        <polyline fill="none" stroke="var(--myst-slides-accent-color)" stroke-width="4" />
      </svg>
      <label style="display: flex; align-items: center; gap: 1em">
        <span>Frequency</span>
        <input type="range" min="${min}" max="${max}" step="0.1" style="flex: 1" />
        <output style="min-width: 3em; font-variant-numeric: tabular-nums"></output>
      </label>
    </div>`;

  const line = el.querySelector('polyline');
  const input = el.querySelector('input');
  const output = el.querySelector('output');

  function update() {
    const frequency = model.get('frequency');
    line.setAttribute('points', curve(frequency));
    input.value = frequency;
    output.textContent = frequency.toFixed(1);
  }

  input.addEventListener('input', () => model.set('frequency', Number(input.value)));
  model.on('change:frequency', update);
  update();
}

export default { render };
