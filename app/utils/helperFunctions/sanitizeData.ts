import validator from "validator";

export default function sanitizeData(validation) {
    const sanitizedData : { [key: string]: string | number } = {};
        for (const [key, value] of Object.entries(validation.data)) {
            if (typeof value === 'string') {
                sanitizedData[key] = validator.escape(value.trim());
            } else {
                sanitizedData[key] = validator.escape(String(value).trim());
            }
        }
    return sanitizedData;    
}