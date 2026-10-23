/**
 * An anywidget module must define and export a `render` function that uses two arguments:
    - model: Widget state, initialized from the JSON body of the directive.
             It has three methods (get, set, on) to update its state, demo'ed below.
    - el: The DOM element that is outputted. It begins empty and authors create DOM elements inside.
 */
function render({ model, el }) {
  // Inject default styles via a <style> tag so that we can over-ride them with a .css file
  // This gives a user more flexibility than hard-coding styles with `style` attributes on the button element.
  const style = document.createElement('style');
  style.textContent = `
    .counter-button {
      font-size: 16px;
      cursor: pointer;
      border: 2px solid #333;
      color: #333;
      border-radius: 4px;
      padding: 0.4em 0.8em;
      background: #f0f0f0;
    }
  `;
  el.appendChild(style);

  // Create the button element that we'll update
  let btn = document.createElement('button');
  btn.classList.add('counter-button');
  btn.innerHTML = `count is ${model.get('count')}`;

  // Attach a click listener to our element to update its state
  // Use `get` to grab the current widget count
  // Use `set` to set a new widget count
  btn.addEventListener('click', () => {
    model.set('count', model.get('count') + 1);
  });

  // Attach an event listener for when the `count` changes to update our HTML
  model.on('change:count', () => {
    btn.innerHTML = `count is ${model.get('count')}`;
  });

  // By attaching it to the `el`, it will now be displayed on the page
  el.appendChild(btn);
}
export default { render };
