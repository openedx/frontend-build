import React from 'react';

const ParagonPreview = () => {
  if (!PARAGON_THEME) {
    return null;
  }
  return (
    <>
      <h2>Paragon</h2>
      <h3>Exposed theme CSS files</h3>
      <ul>
        <li>
          <a href={`/${PARAGON_THEME.paragon.themeUrls.core.fileName}`} target="_blank" rel="noopener noreferrer">
            {PARAGON_THEME.paragon.themeUrls.core.fileName}
          </a>
        </li>
        <li>
          <a href={`/${PARAGON_THEME.paragon.themeUrls.variants.light.fileName}`} target="_blank" rel="noopener noreferrer">
            {PARAGON_THEME.paragon.themeUrls.variants.light.fileName}
          </a>
        </li>
        <li>
          <a href={`/${PARAGON_THEME.brand.themeUrls.core.fileName}`} target="_blank" rel="noopener noreferrer">
            {PARAGON_THEME.brand.themeUrls.core.fileName}
          </a>
        </li>
        <li>
          <a href={`/${PARAGON_THEME.brand.themeUrls.variants.light.fileName}`} target="_blank" rel="noopener noreferrer">
            {PARAGON_THEME.brand.themeUrls.variants.light.fileName}
          </a>
        </li>
      </ul>
      <h3>Contents of <code>PARAGON_THEME</code> global variable</h3>
      <pre>{JSON.stringify(PARAGON_THEME, null, 2)}</pre>
    </>
  );
};

export default ParagonPreview;
