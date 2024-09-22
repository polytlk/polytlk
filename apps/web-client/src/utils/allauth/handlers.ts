import type { AUTH_ENDPOINTS } from './internal/constants';
import type { BaseAuthUrl } from './urls';

function postForm(
  action: `${BaseAuthUrl}${AUTH_ENDPOINTS.REDIRECT_TO_PROVIDER}`,
  data: Record<string, string>
) {
  const f = document.createElement('form');
  f.method = 'POST';
  f.action = action;

  for (const key in data) {
    const d = document.createElement('input');
    d.type = 'hidden';
    d.name = key;
    d.value = data[key] || '';
    f.appendChild(d);
  }
  document.body.appendChild(f);
  f.submit();
}

export { postForm };
