export function parseSingBoxVersion(userAgent: string): string | null {
    const versionRegex = /(?:SFA|SFI|SFM|SFT)\/(\d+)\.(\d+)\.(\d+)(?:-beta\.\d+)?/;
    const match = userAgent.match(versionRegex);
    if (!match) return null;

    return `${match[1]}.${match[2]}.${match[3]}`;
}
