import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { NewResourceParams } from "./lib/db/schema/resources";

const basePath = "./rag_docs";
const pdfPath = `${basePath}/2511.10647v1.pdf`;
const cleanedOutputPath = `${basePath}/output.txt`;

const loader = new PDFLoader(pdfPath);
const loadedPdf = await loader.load();

import { generateText } from "ai";
import fs from "fs/promises";

async function appendFile(path: string, content: string) {
  await fs.appendFile(path, content);
}

const data = loadedPdf.map((page) => {
  const cleaned = page.pageContent.replaceAll("-\n", "").replaceAll("\\n", "");
  return { content: cleaned };
}) as NewResourceParams[];

for (let idx = 0; idx < data.length; idx++) {
  const element = data[idx]!;

  console.log(element);

  const result = await generateText({
    model: "openai/gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: `Clean up the following text without losing any information or context:\n\n${element.content}`,
      },
    ],
  });

  await appendFile(cleanedOutputPath, result.text + "\n");

  console.log(`✅ Cleanup Done [${idx}]`);
}

process.exit(0);
