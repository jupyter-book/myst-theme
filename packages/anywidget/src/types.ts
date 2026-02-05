export type AnyWidgetDirective = {
  /** The type of the directive */
  type: 'anywidget';
  /** The ES module to import */
  esm: string;
  /** The JSON data to initialize the widget */
  json: Record<string, unknown>;
  /** URL to a css stylesheet to load for the widget */
  css?: string;
  /** Tailwind classes to apply to the container element */
  class?: string;
  /** A static filepaths, folder paths or glob patterns to static files to make available to the module */
  static?: string[];
};
