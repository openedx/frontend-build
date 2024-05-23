import ReactDOM from 'react-dom';
import App from './App';

// This line is to emulate what frontend-platform does when i18n initializes.
// It's necessary because our stylesheet is generated with `[dir="ltr"]` as a prefix on all
// direction-sensitive CSS classes.  Without this line, those classes wouldn't be applied to the
// document.  See: https://github.com/openedx/frontend-platform/blob/master/src/i18n/lib.js#L186
global.document.getElementsByTagName('html')[0].setAttribute('dir', 'ltr');

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
