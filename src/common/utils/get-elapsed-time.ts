import prettyMs from '@minikit/pretty-ms';

export function formatExecutionTime(startTime: number): string {
    return prettyMs(Date.now() - startTime);
}

export function getTime(): number {
    return Date.now();
}
