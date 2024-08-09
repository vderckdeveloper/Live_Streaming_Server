module.exports = {
    apps: [
        {
            name: 'liveStreamingServer',
            instances: 'max',
            script: './dist/src/main.js',
            exec_mode: 'cluster', 
            merge_logs: true, 
            autorestart: true, 
            watch: false, 
            listen_timeout: 50000,
            kill_timeout: 5000,
            // pm2 gets excuted on production only
            env: {
                NODE_ENV: 'production' 
            }
        },
    ]
};


