export const generateKeyPair = () => {
    return window.crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey", "deriveBits"],
    );
};

export const exportPublicKey = async (key) => {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

export const deriveSharedSecret = async (privateKey, remotePublicKeySpki) => {
    const remoteKey = await window.crypto.subtle.importKey(
        "spki",
        Uint8Array.from(atob(remotePublicKeySpki), c => c.charCodeAt(0)),
        { name: "ECDH", namedCurve: "P-256" },
        true,
        [],
    );

    const sharedSecret = await window.crypto.subtle.deriveBits(
        { name: "ECDH", public: remoteKey },
        privateKey,
        256,
    );
    
    return new Uint8Array(sharedSecret);
};

export const encryptMasterKey = async (sharedSecretRaw, masterKey) => {
    const hashedKey = await window.crypto.subtle.digest("SHA-256", sharedSecretRaw);

    const cryptoKey = await window.crypto.subtle.importKey(
        "raw", hashedKey, { name: "AES-GCM" }, false, ["encrypt"],
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedMasterKey = new TextEncoder().encode(masterKey);
    
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv }, cryptoKey, encodedMasterKey,
    );

    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv)),
    };
};

export const decryptMasterKey = async (sharedSecretRaw, ciphertextBase64, ivBase64) => {
    const hashedKey = await window.crypto.subtle.digest("SHA-256", sharedSecretRaw);
    
    const cryptoKey = await window.crypto.subtle.importKey(
        "raw", hashedKey, { name: "AES-GCM" }, false, ["decrypt"],
    );

    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
    const encryptedData = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0));

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv }, cryptoKey, encryptedData,
    );
    return new TextDecoder().decode(decrypted);
};