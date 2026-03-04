module.exports = {
  async onPreBuild({utils}) {
    await utils.cache.restore('docs/_build/execute');

    const files = await utils.cache.list({depth: 10})
    console.log('Cached files', files)
  },
  async onPostBuild({utils}) {
    await utils.cache.save('docs/_build/execute');

    const files = await utils.cache.list({depth: 10})
    console.log('Cached files', files)
  },
};
