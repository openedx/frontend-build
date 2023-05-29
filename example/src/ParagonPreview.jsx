import React from 'react';

const ParagonPreview = () => {
  if (!PARAGON) {
    return null;
  }
  return (
    <>
      <h2>Paragon</h2>
      <h3>Exposed Theme CSS</h3>
      <ul>
        <li>
          <a href={`/${PARAGON.themeUrls.core.fileName}`} target="_blank" rel="noopener noreferrer">
            {PARAGON?.themeUrls.core.fileName}
          </a>
        </li>
        <li>
          <a href={`/${PARAGON.themeUrls.variants.light.fileName}`} target="_blank" rel="noopener noreferrer">
            {PARAGON.themeUrls.variants.light.fileName}
          </a>
        </li>
      </ul>
      <h3>Contents of <code>PARAGON</code> global variable</h3>
      <pre>{JSON.stringify(PARAGON, null, 2)}</pre>
    </>
  );
};

export default ParagonPreview;
