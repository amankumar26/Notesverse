import crypto from 'crypto';

// Use a consistent key for development. In production, this MUST be in .env
// AES-256-CBC requires a 32-byte key.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
    ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
    : crypto.createHash('sha256').update(String('development_secret_key_CHANGE_ME')).digest();

const IV_LENGTH = 16; // For AES, this is always 16

export const encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error("Encryption error:", error);
        return text; // Fallback to plain text if encryption fails (or throw error)
    }
};

export const decrypt = (text) => {
    if (!text) return text;
    // Check if it's in the format iv:encrypted
    const textParts = text.split(':');
    if (textParts.length < 2) return text; // Not encrypted or invalid format

    try {
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Decryption error:", error);
        return text; // Return original if decryption fails
    }
};
