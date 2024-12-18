import prettyMs from '@minikit/pretty-ms';

export function formatExecutionTime(startTime: number): string {
    // TODO: Remove this
    return prettyMs(Date.now() - startTime);
}

export function getTime(): number {
    return Date.now();
}
