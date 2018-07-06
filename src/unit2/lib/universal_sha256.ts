export function sha256_node(data: string): Promise<string> {
    const crypto = require('crypto');
    return Promise.resolve(crypto.createHash('sha256').update(data).digest('hex'));
}

export async function sha256_browser(data: string): Promise<string> {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(data);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}

export const sha256 = typeof window === "undefined" ? sha256_node : sha256_browser;
