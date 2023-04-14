import React, { CSSProperties } from 'react';

type ImageProps = {
  src: string;
  alt?: string;
  style?: CSSProperties;
};

const Image = ({ alt, ...rest }:ImageProps) => <img alt={alt} {...rest} />;

const defaultProps = {
  alt: undefined,
  style: undefined,
};
Image.defaultProps = defaultProps;
export default Image;
