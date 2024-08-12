import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// origin host for development and production
const developmentOriginHost = 'http://localhost:3000';
const productionOriginHost = 'https://your-service-domain.com';

interface Message {
    role: string;
    type: string;
    message: string;
    downloadLink?: string;
}

@WebSocketGateway({
    namespace: '/websocket/webrtc-signal',
    cors: {
        credentials: true,
        origin: process.env.NODE_ENV === 'development' ? developmentOriginHost : productionOriginHost,
        methods: ["GET", "POST"],
    }
})

export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    // constructor
    constructor() { }

    async handleConnection(socket: Socket, _) {
        console.log(socket.id);
    }

    handleDisconnect(socket: Socket) {
       
    }

    @SubscribeMessage('candidate')
    async handleCandidate(socket: any, message: Message) {
        // candidate message sent
        // console.log('candidate', message);
    }
}
