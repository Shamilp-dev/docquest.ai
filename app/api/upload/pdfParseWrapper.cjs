// Wrapper to import pdf-parse CommonJS module
// pdf-parse v1 has a simple function-based API
// This wrapper ensures module.parent is set, preventing debug mode from triggering

// Set environment variable to disable debug mode before requiring
process.env.AUTO_KENT_DEBUG = 'false';

// Import the actual pdf-parse library directly (not the index.js which has debug code)
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

// Verify it's a function
if (typeof pdfParse !== "function") {
  throw new Error("pdf-parse did not export a function");
}

// Export the function directly
module.exports = pdfParse;

