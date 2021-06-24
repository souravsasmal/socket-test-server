const net = require('net');
const dgram = require('dgram');
const udpServer = dgram.createSocket('udp4');
const DomParser = require('dom-parser');
const parser = new DomParser();

udpServer.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    udpServer.close();
});

try {
    createTCPServer('0.0.0.0');
} catch (e) {
}

udpServer.on('message', (msg, rinfo) => {
    console.log(`server got: \n${msg} \nfrom ${rinfo.address}:${rinfo.port}`);
});

udpServer.on('listening', () => {
    const address = udpServer.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

udpServer.bind(10001);

function sendDiscoverySuccess(mToIP) {
    let client = new net.Socket();
    client.connect(10003, mToIP, function () {
        console.log('Connected');
    });

    client.on('data', function (data) {
        console.log('Received: ' + data);
        client.destroy(); // kill client after server's response
    });

    client.on('close', function () {
        console.log('Connection closed');
    });
}

function createTCPServer(mBindIP) {
    const server = net.createServer((socket) => {
        socket.on('data', (data) => {
            console.log((new Date()) + ': ' + data.toString());
            const mData = parser.parseFromString(data.toString(), 'application/xml');
            try {
                console.log('Replying...');
                socket.write('Ok');
            } catch (e) {
                console.log(e);
            }
        });
    }).on('error', (err) => {
        // Handle errors here.
        throw err;
    });

    server.listen({port: 10002, family: 'IPv4', host: mBindIP}, () => {
        console.log('opened server on', server.address());
    });
}
