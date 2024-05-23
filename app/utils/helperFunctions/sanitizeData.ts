import validator from "validator";

export default function sanitizeData(validation: { success?: true; data: any; }) {
  const sanitizedData: { [key: string]: string | number } = {};
  for (const [key, value] of Object.entries(validation.data)) {
    if (typeof value === "string") {
      sanitizedData[key] = validator.escape(value.trim());
    } else {
      sanitizedData[key] = validator.escape(String(value).trim());
    }
  }
  return sanitizedData;
}
