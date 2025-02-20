import { ImgHTMLAttributes } from 'react';

const Image = ({ alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...rest} />;

export default Image;
