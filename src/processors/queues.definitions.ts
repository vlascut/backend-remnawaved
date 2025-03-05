import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardQueueOptions } from '@bull-board/nestjs';
import { camelCase, upperFirst } from 'scule';

import { InjectQueue, RegisterQueueOptions } from '@nestjs/bullmq';

export const QUEUE_NAMES = {
    START_NODE: 'start-node',
    STOP_NODE: 'stop-node',
    RESTART_NODE: 'restart-node',
    START_ALL_NODES: 'start-all-nodes',

    HEALTH_CHECK: 'nodes-health-check',
    USAGE_RECORDER: 'nodes-usage-recorder',

    EXPIRED_FINDER: 'users-expired-finder',
} as const;

export type TQueueNames = keyof typeof QUEUE_NAMES;
export type TQueueNamesValues = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
export const QUEUES_NAMES = Object.keys(QUEUE_NAMES);
export const QUEUE_VALUES = Object.values(QUEUE_NAMES);

const createQueueDecorator = (queueName: TQueueNamesValues): ParameterDecorator =>
    InjectQueue(queueName);

type QueueInjectorsType = {
    [K in keyof typeof QUEUE_NAMES as `inject${Capitalize<CamelCase<K & string>>}Queue`]: () => ParameterDecorator;
};

type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
    ? `${Lowercase<P>}${Capitalize<CamelCase<Q>>}`
    : Lowercase<S>;

const createQueueInjectorsFromKeys = (): QueueInjectorsType => {
    const result: Record<string, () => ParameterDecorator> = {};

    for (const key of Object.keys(QUEUE_NAMES) as Array<keyof typeof QUEUE_NAMES>) {
        const methodName = `inject${upperFirst(camelCase(key, { normalize: true }))}Queue`;
        result[methodName] = () => createQueueDecorator(QUEUE_NAMES[key]);
        console.log('methodName', QUEUE_NAMES[key]);
    }

    return result as QueueInjectorsType;
};

export const Queues = createQueueInjectorsFromKeys();

export const BULLMQ_QUEUES: RegisterQueueOptions[] = QUEUE_VALUES.map((name) => ({
    name,
}));

export const BULLBOARD_QUEUES: BullBoardQueueOptions[] = QUEUE_VALUES.map((name) => ({
    name,
    adapter: BullMQAdapter,
    options: {},
}));

export const QueueUtils = {
    getJobId: (jobName: string, uniqueId: string): string => `${jobName}-${uniqueId}`,
    isJobCompleted: (status: string): boolean => status === 'completed',
    isJobFailed: (status: string): boolean => status === 'failed',
    isJobActive: (status: string): boolean => status === 'active',
};
