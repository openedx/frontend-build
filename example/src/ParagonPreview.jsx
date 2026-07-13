import { Button, Stack } from '@openedx/paragon';

const ParagonPreview = () => {
  if (!PARAGON_THEME) {
    return <p>Missing <code>PARAGON_THEME</code> global variable. Depending on configuration, this may be OK.</p>;
  }
  return (
    <>
      <h2>Paragon</h2>

      <Stack gap={4.5}>
        <div>
          <h3>Component preview</h3>
          <div className="px-3 py-2 bg-light-200">
            <Button>Hello world</Button>
          </div>
        </div>
        <div>
          <h3>Exposed theme CSS files</h3>
          <p>
            <em>
              Note: Depending on the versions of <code>@openedx/paragon</code> and/or <code>@edx/brand</code> installed,
              it is expected that no exposed theme CSS assets be listed here.
            </em>
          </p>
          <ul className="mb-0">
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
        </div>
        <div>
          <h3>Contents of <code>PARAGON_THEME</code> global variable</h3>
          <pre>{JSON.stringify(PARAGON_THEME, null, 2)}</pre>
        </div>
      </Stack>
    </>
  );
};

export default ParagonPreview;
