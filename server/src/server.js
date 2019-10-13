const express = require('express');

const loaders = require('./loaders');

module.exports = async function StartServer({ repo, host, port }) {
  const app = express();

  await loaders({ app, repo });

  app.listen(port, host, err => {
    if (err) {
      console.error(err);
      process.exit(1);
      return;
    }
    console.log(`Server running on http://${host}:${port}`);
  });
};
