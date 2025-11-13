const NodeMediaServer = require('node-media-server');

// FLV không cần FFmpeg

// FLV không cần tạo thư mục media

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60
    },
    http: {
        port: 8000,
        allow_origin: '*',
        api: true
    }
};

// FLV không cần FFmpeg transcoding
// RTMP server tự động serve FLV qua HTTP

const nms = new NodeMediaServer(config);

// Event handlers
nms.on('preConnect', (id, args) => {
    console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('postConnect', (id, args) => {
    console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
    console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('postPublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    console.log('Stream started!');
});

nms.on('donePublish', (id, StreamPath, args) => {
    console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
    console.log('Stream ended!');
});

nms.on('prePlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('postPlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
    console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

// Start server
nms.run();

console.log('');
console.log('='.repeat(60));
console.log('RTMP Server Started Successfully!');
console.log('='.repeat(60));
console.log('');
console.log('RTMP Server:  rtmp://localhost:1935/live');
console.log('HLS Server:   http://localhost:8000');
console.log('');
console.log('OBS Configuration:');
console.log('  Server: rtmp://localhost:1935/live');
console.log('  Key:    (your stream key from dashboard)');
console.log('');
console.log('FLV Stream URL:');
console.log('  http://localhost:8000/live/{STREAM_KEY}.flv');
console.log('');
console.log('Status: FLV streaming ENABLED (no FFmpeg needed)');
console.log('Latency: 2-3 seconds (lower than HLS)');

console.log('');
console.log('='.repeat(60));
console.log('');
