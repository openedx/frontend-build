// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { render } from '@testing-library/react';
import App from './App';

describe('Basic test', () => {
  it('should render', () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });
});
