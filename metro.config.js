// Metro configuration
// Collapse or filter out anonymous frames during symbolication to avoid ENOENT on "<anonymous>"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = config.server || {};
config.server.symbolicator = config.server.symbolicator || {};

config.server.symbolicator.customizeFrame = (frame) => {
  // Hide frames with bogus file paths like "<anonymous>"
  if (frame.file && typeof frame.file === 'string' && frame.file.includes('<anonymous>')) {
    return { collapse: true };
  }
  return frame;
};

module.exports = config;

