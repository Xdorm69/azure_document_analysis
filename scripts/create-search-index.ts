import * as dotenv from "dotenv";
dotenv.config();

import {
  createSearchIndex,
} from "@/lib/azure/create-search-index";

createSearchIndex()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });