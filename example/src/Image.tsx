import React, { CSSProperties } from "react";

type ImageProps = {
  src: string;
  alt?: string;
  style?: CSSProperties;
};

export default function Image(props:ImageProps) {
  return <img {...props} />;
}
