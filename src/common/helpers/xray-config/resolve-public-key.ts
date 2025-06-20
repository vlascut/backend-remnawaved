import { createPrivateKey, createPublicKey, KeyObject } from 'node:crypto';

export async function resolveInboundAndPublicKey(inbounds: any[]): Promise<Map<string, string>> {
    const publicKeyMap = new Map<string, string>();

    for (const inbound of inbounds) {
        if (inbound.streamSettings?.realitySettings?.privateKey) {
            try {
                if (publicKeyMap.has(inbound.tag)) {
                    continue;
                }

                const { publicKey: jwkPublicKey } = await createX25519KeyPairFromBase64(
                    inbound.streamSettings.realitySettings.privateKey,
                );

                const publicKeyJwk = jwkPublicKey.export({ format: 'jwk' });

                if (!publicKeyJwk) {
                    continue;
                }

                const pubKeyRaw = publicKeyJwk.x;

                if (!pubKeyRaw) {
                    continue;
                }

                publicKeyMap.set(inbound.tag, pubKeyRaw);
            } catch {
                continue;
            }
        }
    }

    return publicKeyMap;
}

async function createX25519KeyPairFromBase64(base64PrivateKey: string): Promise<{
    publicKey: KeyObject;
    privateKey: KeyObject;
}> {
    return new Promise((resolve, reject) => {
        try {
            const rawPrivateKey = Buffer.from(base64PrivateKey, 'base64');

            const jwkPrivateKey = {
                kty: 'OKP',
                crv: 'X25519',
                d: Buffer.from(rawPrivateKey).toString('base64url'),
                x: '',
            };

            const privateKey = createPrivateKey({
                key: jwkPrivateKey,
                format: 'jwk',
            });

            const publicKey = createPublicKey(privateKey);

            resolve({ publicKey, privateKey });
        } catch (error) {
            reject(error);
        }
    });
}
