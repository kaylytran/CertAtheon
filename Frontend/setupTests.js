// setupTests.js
require('@testing-library/jest-dom');

// Polyfill TextEncoder (fixes "TextEncoder is not defined" error in Jest)
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;