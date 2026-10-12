// Render the text breakdowns in processed/json/ to PDFs in every layout, using headless Google Chrome:
//   processed/pdf/<name>.pdf      A4 landscape tables (a4.mjs)
//   processed/kindle/<name>.pdf   cards sized for a 7" Kindle (kindle.mjs)
//
// Usage:
//   node scripts/render/index.mjs                   # every text in processed/json/
//   node scripts/render/index.mjs file1.json ...    # specific files

import a4 from "./a4.mjs";
import { main } from "./common.mjs";
import kindle from "./kindle.mjs";

main([a4, kindle]);
