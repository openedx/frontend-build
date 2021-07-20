/* eslint-disable global-require */
import renderer from 'react-test-renderer';
import App from './App';

describe('Basic test', () => {
  it('should render', () => {
    const Component = <App />;
    const tree = renderer.create(Component);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
