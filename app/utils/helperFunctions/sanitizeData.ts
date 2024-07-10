import validator from "validator";

export default function sanitizeData(validation: { success?: true; data: any; }) {
  const sanitizedData: { [key: string]: string | number | string[] } = {};
  for (const [key, value] of Object.entries(validation.data)) {
    if (typeof value === "string") {
      sanitizedData[key] = validator.escape(value.trim());
    } else if (Array.isArray(value)) {
      sanitizedData[key] = value.map(item => validator.escape(String(item).trim()));
    } else {
      sanitizedData[key] = validator.escape(String(value).trim());
    }
  }
  return sanitizedData;
}
