import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// room name service
import { RoomNameService } from 'src/roomname/roomName.service';

// origin host for development and production
const developmentOriginHost = 'http://localhost:3000';
const productionOriginHost = 'https://your-service-domain.com';

interface RoomCode {
    roomCode: string;
}

interface Message {
    roomCode: string;
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
    constructor(
        private readonly roomNameService: RoomNameService,
    ) { }

    async handleConnection(socket: Socket, _) {

    }

    handleDisconnect(socket: Socket) {
       
    }

    @SubscribeMessage('register')
    async handleRegister(socket: any, roomCode: RoomCode) {
        // check room code type
        if (typeof roomCode !== 'string') return;
        // create room if the participant is the first member or add member into the room
        this.roomNameService.setRoom(roomCode, socket.id);

        const roomMember = this.roomNameService.getMembers(roomCode);
        console.log(roomMember);
    }

    @SubscribeMessage('candidate')
    async handleCandidate(socket: any, message: Message) {
        // candidate message sent
        // console.log('candidate', message);
    }

    @SubscribeMessage('offer')
    async handleOffer(socket: any, message: Message) {
        // offer
        // console.log('candidate', message);
    }

    @SubscribeMessage('answer')
    async handleAnswer(socket: any, message: Message) {
        // answer
        // console.log('candidate', message);
    }
}
