// Wrapper to import pdf-parse CommonJS module
// Use createRequire to import CommonJS in ESM context
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const pdfParse = require("pdf-parse");
export default pdfParse;

