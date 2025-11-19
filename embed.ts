import { createResource } from "./lib/actions/resources";
import { NewResourceParams } from "./lib/db/schema/resources";

const basePath ="./";
const cleanedOutputPath = `${basePath}/output.txt`;

import fs from "fs/promises";

const fileContent = await fs.readFile(cleanedOutputPath, "utf-8");
const content = fileContent.split("\n").filter((line) => line.trim() !== "");

const data = content.map((page) => {
  const cleaned = page.replaceAll("-\n", "").replaceAll("\\n", "");
  return { content: cleaned };
}) as NewResourceParams[];

for (let idx = 0; idx < data.length; idx++) {
  const element = data[idx]!;

  await createResource(element);
  console.log(`✅ Done [${idx}]`);
}

process.exit(0);
