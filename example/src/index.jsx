import ReactDOM from 'react-dom';
import {
  AppProvider,
  ErrorPage,
} from '@edx/frontend-platform/react';
import { APP_INIT_ERROR, APP_READY, initialize } from '@edx/frontend-platform';
import { subscribe } from '@edx/frontend-platform/pubSub';

import App from './App';

// This line is to emulate what frontend-platform does when i18n initializes.
// It's necessary because our stylesheet is generated with `[dir="ltr"]` as a prefix on all
// direction-sensitive CSS classes.  Without this line, those classes wouldn't be applied to the
// document.  See: https://github.com/openedx/frontend-platform/blob/master/src/i18n/lib.js#L186
global.document.getElementsByTagName('html')[0].setAttribute('dir', 'ltr');

subscribe(APP_READY, () => {
  ReactDOM.render(
    <AppProvider>
      <App />
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
