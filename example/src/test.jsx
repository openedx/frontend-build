/* eslint-disable global-require */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import App from './App';

describe('Basic test', () => {
  it('should render', () => {
    const component = <App />;
    const tree = renderer.create(component);
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
