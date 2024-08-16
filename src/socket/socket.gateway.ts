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

interface OfferSDPMessage {
    offer: {
        sdp: string;
        type: string;
    }; 
    offerId: string;
    peerId: string;
}

interface AnswerSDPMessage {
    answer: {
        sdp: string;
        type: string;
    }; 
    offerId: string;
    peerId: string;
}

interface ICECandidate {
    candidate: {
        candidate :string;
        spdMid: string;
        spdMLineIndex: number;
        usernameFragment: string;
    };
    peerId: string;
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

    // handle connection
    async handleConnection(socket: Socket, _) {

    }

    // handle disconnection
    handleDisconnect(socket: Socket) {
        // find which room the member joined
        const roomCode = this.memberRoomService.getMemberRoom(socket.id);

        // remove member from the room when disconnected
        this.roomNameService.removeMember(roomCode, socket.id);

        // remove member room from the tracking
        this.memberRoomService.deleteMemberRoom(socket.id);
    }

    // subscribe register
    @SubscribeMessage('register')
    async handleRegister(socket: any, roomCode: RoomCode) {
        // check room code type
        if (typeof roomCode !== 'string') return;

        // If room members exceed 2, disconnect the socket
        const roomMember = this.roomNameService.getMembers(roomCode);
        // return if room member is equal or more than 4 (only 4 room members are allowed)
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

    // subscribe candidate
    @SubscribeMessage('candidate')
    async handleCandidate(socket: any, ICEcandidate: ICECandidate) {
        // peer id
        const { peerId } = ICEcandidate;

        // send candidate list to the previosuly joined member (offer member -> answer member) 
        socket.to(peerId).emit('candidate', ICEcandidate);
    }

    // subscribe offer
    @SubscribeMessage('offer')
    async handleOffer(socket: any, offerSDPMessage: OfferSDPMessage) {
        // peer id
        const { peerId } = offerSDPMessage;

        // send offer to the previosuly joined member (offer member -> answer member)
        socket.to(peerId).emit('offer', offerSDPMessage);
    }

    // subscribe answer
    @SubscribeMessage('answer')
    async handleAnswer(socket: any, answerSDPmessage: AnswerSDPMessage) {
        // offer id
        const { offerId } = answerSDPmessage; 

        // send answer to the later joined member (answer member -> offer member)
        socket.to(offerId).emit('answer', answerSDPmessage);
    }
}
