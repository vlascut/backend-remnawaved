module.exports = {
    apps: [
        {
            name: 'remnawave-api',
            script: 'dist/src/main.js',
            watch: false,
            instances: process.env.INSTANCES || 1,
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
            instances: 1, // DO NOT CHANGE THIS
            exec_mode: 'fork',
            env_development: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
            },
        },
    ],
};
