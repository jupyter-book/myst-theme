import type { Theme } from '@myst-theme/common';

export function postThemeToAPI(theme: Theme) {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open('POST', '/api/theme');
  xmlhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xmlhttp.send(JSON.stringify({ theme }));
}
