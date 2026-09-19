const {
  discoverApiEndpoints,
  materializePath
} = require('./project_inventory');

const endpoints = discoverApiEndpoints();

module.exports = {
  endpoints,
  materializePath
};
