import React from 'react';

const ParagonPreview = () => {
  if (!PARAGON_THEME) {
    return <p>Missing <code>PARAGON_THEME</code> global variable. Depending on configuration, this may be OK.</p>;
  }
  return (
    <>
      <h2>Paragon</h2>
      <h3>Exposed theme CSS files</h3>
      <p>
        <em>
          Note: Depending on the versions of <code>@edx/paragon</code> and/or <code>@edx/brand</code> installed,
          it is expected that no exposed theme CSS assets be listed here.
        </em>
      </p>
      <ul>
        {PARAGON_THEME.paragon.themeUrls.core.fileName && (
          <li>
            <a href={`/${PARAGON_THEME.paragon.themeUrls.core.fileName}`} target="_blank" rel="noopener noreferrer">
              {PARAGON_THEME.paragon.themeUrls.core.fileName}
            </a>
          </li>
        )}
        {PARAGON_THEME.paragon.themeUrls.variants.light?.fileName && (
          <li>
            <a href={`/${PARAGON_THEME.paragon.themeUrls.variants.light.fileName}`} target="_blank" rel="noopener noreferrer">
              {PARAGON_THEME.paragon.themeUrls.variants.light.fileName}
            </a>
          </li>
        )}
        {PARAGON_THEME.brand.themeUrls.core.fileName && (
          <li>
            <a href={`/${PARAGON_THEME.brand.themeUrls.core.fileName}`} target="_blank" rel="noopener noreferrer">
              {PARAGON_THEME.brand.themeUrls.core.fileName}
            </a>
          </li>
        )}
        {PARAGON_THEME.brand.themeUrls.variants.light?.fileName && (
          <li>
            <a href={`/${PARAGON_THEME.brand.themeUrls.variants.light.fileName}`} target="_blank" rel="noopener noreferrer">
              {PARAGON_THEME.brand.themeUrls.variants.light.fileName}
            </a>
          </li>
        )}
      </ul>
      <h3>Contents of <code>PARAGON_THEME</code> global variable</h3>
      <pre>{JSON.stringify(PARAGON_THEME, null, 2)}</pre>
    </>
  );
};

export default ParagonPreview;
