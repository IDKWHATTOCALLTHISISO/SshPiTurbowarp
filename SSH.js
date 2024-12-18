class SSHPiExtension {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.ipAddress = ''; // Store IP address
    }

    getInfo() {
        return {
            id: 'sshtopi',
            name: 'SSH to Pi',
            blocks: [
                {
                    opcode: 'setIP',
                    blockType: 'command',
                    text: 'Set Raspberry Pi IP to [IP]',
                    arguments: {
                        IP: { type: 'string', defaultValue: '192.168.1.1' },
                    },
                },
                {
                    opcode: 'connect',
                    blockType: 'command',
                    text: 'Connect to Raspberry Pi with user [USERNAME] and password [PASSWORD]',
                    arguments: {
                        USERNAME: { type: 'string', defaultValue: 'pi' },
                        PASSWORD: { type: 'string', defaultValue: 'raspberry' },
                    },
                },
                {
                    opcode: 'runCommand',
                    blockType: 'reporter',
                    text: 'Run command [CMD] on Raspberry Pi',
                    arguments: {
                        CMD: { type: 'string', defaultValue: 'ls' },
                    },
                },
                {
                    opcode: 'disconnect',
                    blockType: 'command',
                    text: 'Disconnect from Raspberry Pi',
                },
            ],
        };
    }

    setIP(args) {
        this.ipAddress = args.IP;
    }

    async connect(args) {
        if (!this.ipAddress) {
            throw new Error('IP address not set. Use the "Set Raspberry Pi IP" block first.');
        }

        const { Client } = await import('ssh2');
        this.connection = new Client();

        return new Promise((resolve, reject) => {
            this.connection
                .on('ready', () => {
                    this.isConnected = true;
                    resolve('Connected successfully');
                })
                .on('error', (err) => {
                    reject(`Connection failed: ${err.message}`);
                })
                .connect({
                    host: this.ipAddress,
                    port: 22,
                    username: args.USERNAME,
                    password: args.PASSWORD,
                });
        });
    }

    async runCommand(args) {
        if (!this.isConnected || !this.connection) {
            throw new Error('Not connected to Raspberry Pi');
        }

        return new Promise((resolve, reject) => {
            this.connection.exec(args.CMD, (err, stream) => {
                if (err) return reject(err);

                let data = '';
                stream
                    .on('data', (chunk) => {
                        data += chunk.toString();
                    })
                    .on('close', () => {
                        resolve(data);
                    });
            });
        });
    }

    disconnect() {
        if (this.connection) {
            this.connection.end();
            this.isConnected = false;
        }
    }
}

Scratch.extensions.register(new SSHPiExtension());
