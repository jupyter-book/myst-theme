export type AnyWidget = {
  /** The type of the directive */
  type: 'anywidget';
  /** The ES module to import */
  esm: string;
  /** The data to initialize the widget */
  model: Record<string, unknown>;
  /** URL to a css stylesheet to load for the widget */
  css?: string;
  /** Tailwind classes to apply to the container element */
  class?: string;
};
