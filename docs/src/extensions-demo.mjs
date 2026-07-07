/**
 * Directive for the runtime theme extension demo (see extensions.md).
 * It emits a custom AST node that is rendered by src/theme-extension/.
 */
const fancyNoteDirective = {
  name: 'fancy-note',
  doc: 'A note rendered by a custom theme extension.',
  arg: { type: String, doc: 'Title of the note' },
  body: { type: 'myst', doc: 'Content of the note' },
  run(data) {
    return [{ type: 'fancyNote', title: data.arg, children: data.body ?? [] }];
  },
};

const plugin = {
  name: 'Theme extension demo',
  directives: [fancyNoteDirective],
};

export default plugin;
