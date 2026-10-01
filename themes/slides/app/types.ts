import type { CommonTemplateOptions } from '@myst-theme/common';

export type TemplateOptions = CommonTemplateOptions & {
  slide_level?: number;
  transition?: 'none' | 'fade' | 'slide' | 'convex' | 'concave' | 'zoom';
  slide_number?: boolean;
  hide_controls?: boolean;
  hide_progress?: boolean;
  hide_title_slide?: boolean;
  align_top?: boolean;
  width?: number;
  height?: number;
  hide_theme_toggle?: boolean;
  code_theme?: string;
  code_theme_dark?: string;
};
