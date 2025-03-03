import { PrismaClient } from '@prisma/client';

export const XTLSDefaultConfig = {
    log: {
        loglevel: 'info',
    },
    inbounds: [
        {
            tag: 'Shadowsocks',
            port: 1234,
            protocol: 'shadowsocks',
            settings: {
                clients: [],
                network: 'tcp,udp',
            },
            sniffing: {
                enabled: true,
                destOverride: ['http', 'tls', 'quic'],
            },
        },
    ],
    outbounds: [
        {
            protocol: 'freedom',
            tag: 'DIRECT',
        },
        {
            protocol: 'blackhole',
            tag: 'BLOCK',
        },
    ],
    routing: {
        rules: [
            {
                ip: ['geoip:private'],
                outboundTag: 'BLOCK',
                type: 'field',
            },
            {
                domain: ['geosite:private'],
                outboundTag: 'BLOCK',
                type: 'field',
            },
            {
                protocol: ['bittorrent'],
                outboundTag: 'BLOCK',
                type: 'field',
            },
        ],
    },
};

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function seedConfigVariables() {
    const existingConfig = await prisma.xrayConfig.findFirst();

    if (existingConfig) {
        console.log('Default XTLS config already seeded!');
        return;
    }

    const config = await prisma.xrayConfig.create({
        data: {
            config: XTLSDefaultConfig,
        },
    });

    if (!config) {
        throw new Error('Failed to create default config!');
    }

    console.log('Default XTLS config seeded!');
}

seedConfigVariables()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
