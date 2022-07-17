import neatCsv from "neat-csv";

export const parse = async (csv: string) => {
  let result;

  try {
    result = await neatCsv(csv);
    if (result == null) {
      throw new Error("Unable to parse CSV");
    }
  } catch (err) {
    console.error("Failed to parse csv", err);
  }

  return result;
};
