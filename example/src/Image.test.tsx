import renderer from 'react-test-renderer';
import Image from './Image';

describe('Basic test', () => {
  it('should render', () => {
    const Component = <Image src="foo" alt="alt" />;
    const tree = renderer.create(Component);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
