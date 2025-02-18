module.exports = {
    apps: [
        {
            name: 'remnawave-api',
            script: 'dist/src/main.js',
            watch: false,
            instances: process.env.INSTANCES || 1,
            merge_logs: true,
            exec_mode: 'cluster',
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
        {
            name: 'remnawave-jobs',
            script: 'dist/src/worker.js',
            watch: false,
            instances: 1, // DO NOT SCALE WORKER
            exec_mode: 'fork',
            merge_logs: true,
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
