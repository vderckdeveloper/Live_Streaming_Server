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

// member room service0
import { MemberRoomService } from 'src/memberroom/memberRoom.service';

// origin host for development and production
const developmentOriginHost = 'http://localhost:3000';
const productionOriginHost = 'https://your-service-domain.com';

interface RoomCode {
    roomCode: string;
}

interface SDPMessage {
    roomCode: string;
    offerId ?: string;
    peerId ?: string;
}

interface ICECandidate {
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
        private readonly memberRoomService: MemberRoomService,
    ) { }

    async handleConnection(socket: Socket, _) {

    }

    handleDisconnect(socket: Socket) {
        // find which room the member joined
        const roomCode = this.memberRoomService.getMemberRoom(socket.id);

        // remove member from the room when disconnected
        this.roomNameService.removeMember(roomCode, socket.id);

        // remove member room from the tracking
        this.memberRoomService.deleteMemberRoom(socket.id);
    }

    @SubscribeMessage('register')
    async handleRegister(socket: any, roomCode: RoomCode) {
        // check room code type
        if (typeof roomCode !== 'string') return;

        // If room members exceed 2, disconnect the socket
        const roomMember = this.roomNameService.getMembers(roomCode);
        if (roomMember.length >= 4) {
            socket.emit('error', 'Room is full');
            socket.disconnect(true);
            return;
        }

        // create room if the participant is the first member or add member into the room
        this.roomNameService.setRoom(roomCode, socket.id);

        // map each member to a room to track
        this.memberRoomService.setMemberRoom(socket.id, roomCode);

        // join room
        socket.join(roomCode);

        // Filter out the current socket ID from the room members
        const otherMembers = roomMember.filter(peerSocketId => peerSocketId !== socket.id);

        // send peer socket id to the later participant
        otherMembers.forEach(peerSocketId => {
            socket.emit('register', { offerId: socket.id, peerId: peerSocketId });
        });
    }

    @SubscribeMessage('candidate')
    async handleCandidate(socket: any, ICEcandidate: ICECandidate) {
        // // candidate message sent
        // console.log('candidate', ICEcandidate);
        const roomCode = this.memberRoomService.getMemberRoom(socket.id);
        const roomMember = this.roomNameService.getMembers(roomCode);

        // Filter out the current socket ID from the room members
        const otherMembers = roomMember.filter(peerSocketId => peerSocketId !== socket.id);

        // Broadcast the ICE candidate to all other clients in the room except the sender
        otherMembers.forEach(peerSocketId => {
            socket.to(peerSocketId).emit('candidate', ICEcandidate);
        });
    }

    @SubscribeMessage('offer')
    async handleOffer(socket: any, SDPmessage: SDPMessage) {
        // peer id
        const { peerId } = SDPmessage;

        // Broadcast the ICE candidate to all other clients in the room except the sender
        socket.to(peerId).emit('offer', SDPmessage);
    }

    @SubscribeMessage('answer')
    async handleAnswer(socket: any, SDPmessage: SDPMessage) {
        // offer id
        const { offerId } = SDPmessage; 

        // Broadcast the ICE candidate to all other clients in the room except the sender
        socket.to(offerId).emit('answer', SDPmessage);
    }
}
