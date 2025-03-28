import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@src/App';

// This line is to emulate what frontend-platform does when i18n initializes.
// It's necessary because our stylesheet is generated with `[dir="ltr"]` as a prefix on all
// direction-sensitive CSS classes.  Without this line, those classes wouldn't be applied to the
// document.  See: https://github.com/openedx/frontend-platform/blob/master/src/i18n/lib.js#L186
global.document.getElementsByTagName('html')[0].setAttribute('dir', 'ltr');

const rootContainer = document.getElementById('root');
if (rootContainer) {
  const root = createRoot(rootContainer);
  root.render(<StrictMode><App /></StrictMode>);
}
