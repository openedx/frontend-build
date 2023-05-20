import React from 'react';

const ParagonPreview = () => (
  <>
    <h2>Paragon</h2>
    <h3>Exposed Theme CSS</h3>
    <ul>
      <li>
        <a href={`/${PARAGON.themeUrls.core}`} target="_blank" rel="noopener noreferrer">
          {PARAGON.themeUrls.core}
        </a>
      </li>
      <li>
        <a href={`/${PARAGON.themeUrls.variants.light}`} target="_blank" rel="noopener noreferrer">
          {PARAGON.themeUrls.variants.light}
        </a>
      </li>
    </ul>
    <h3>Contents of <code>PARAGON</code> global variable</h3>
    <pre>{JSON.stringify(PARAGON, null, 2)}</pre>
  </>
);

export default ParagonPreview;
