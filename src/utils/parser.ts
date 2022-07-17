import { readFile } from "fs/promises";
import neatCsv from "neat-csv";

export const parse = async (filePath: string) => {
  let result;

  try {
    const fileBuffer = await readFile(filePath);
    result = await neatCsv(fileBuffer);
    if (result == null) {
      throw new Error("Unable to parse CSV");
    }
  } catch (err) {
    console.error("Failed to parse csv", err);
  }

  return result;
};
