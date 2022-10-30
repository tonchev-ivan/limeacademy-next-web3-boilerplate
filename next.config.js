// @ts-check
require('dotenv').config()
/**
 * @type {import('next').NextConfig}
 **/
module.exports = {
  reactStrictMode: true,
  swcMinify: true,

  env: {
    US_ELECTION_ADDRESS: process.env.US_ELECTION_ADDRESS,
  },
};
