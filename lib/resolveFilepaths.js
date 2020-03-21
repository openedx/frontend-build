module.exports = (filepaths, resolvePaths = [process.cwd()]) => {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < filepaths.length; i++) {
    try {
      return require.resolve(filepaths[i], { paths: resolvePaths });
    } catch (e) {
      // Do nothing, maybe we'll find it in the next loop
    }
  }
  throw new Error(`Could not resolve files:\n ${filepaths.join('\n')}\n\n in directories:\n ${resolvePaths.join(', ')}\n`);
};
