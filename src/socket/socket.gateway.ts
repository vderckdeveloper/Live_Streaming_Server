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

interface OfferICECandidate {
    candidate: {
        candidate: string;
        spdMid: string;
        spdMLineIndex: number;
        usernameFragment: string;
    };
    offerId: string;
    answerId: string;
}

interface AnswerICECandidate {
    candidate: {
        candidate: string;
        spdMid: string;
        spdMLineIndex: number;
        usernameFragment: string;
    };
    offerId: string;
    answerId: string;
}

interface OfferSDPMessage {
    offer: {
        sdp: string;
        type: string;
    };
    offerId: string;
    answerId: string;
}

interface AnswerSDPMessage {
    answer: {
        sdp: string;
        type: string;
    };
    offerId: string;
    answerId: string;
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
    async handleDisconnect(socket: Socket) {
        // find which room the member joined
        const roomCode = await this.memberRoomService.getMemberRoom(socket.id);

        // remove member from the room when disconnected
        this.roomNameService.removeMember(roomCode, socket.id);

        // remove member room from the tracking
        this.memberRoomService.deleteMemberRoom(socket.id);

        // get room member list
        const roomMember: string[] = await this.roomNameService.getMembers(roomCode);

        // room member count
        const roomMemberCount = roomMember.length;

        // data to send 
        const data = {
            disconnectedMemberId: socket.id,
            roomMemberCount: roomMemberCount
        }

        // send room member who got disconnected
        socket.to(roomCode).emit('disconnectedMember', data);
    }

    // subscribe register
    @SubscribeMessage('register')
    async handleRegister(socket: any, roomCode: RoomCode) {
        // check room code type
        if (typeof roomCode !== 'string') return;

        // create room if the participant is the first member or add member into the room
        this.roomNameService.setRoom(roomCode, socket.id);

        // map each member to a room to track
        this.memberRoomService.setMemberRoom(socket.id, roomCode);

        // If room members exceed 4, disconnect the socket
        const roomMember: string[] = await this.roomNameService.getMembers(roomCode);
        // return if room member is equal or more than 4 (only 4 room members are allowed)
        if (roomMember.length > 4) {
            // error Message
            const errorMessage = {
                statusCode: 403,
                message: 'room_is_full',
            };

            socket.emit('room_error', errorMessage);
            socket.disconnect(true);
            return;
        }

        // join room
        socket.join(roomCode);

        // Filter out the current socket ID from the room members
        const otherMembers = roomMember.filter(peerSocketId => peerSocketId !== socket.id);

        // send how many room members are in the room to all the member in the room
        const roomMemberCount = roomMember.length;
        this.server.in(roomCode).emit('roomMemberCount', roomMemberCount);

        // send peer socket id to the later participant 
        otherMembers.forEach(peerSocketId => {
            socket.emit('register', { offerId: socket.id, answerId: peerSocketId });
        });
    }

    // subscribe offer candidate (offer member -> answer member) 
    @SubscribeMessage('offercandidate')
    async handleOfferCandidate(socket: any, offerICEcandidate: OfferICECandidate) {
        // find which room the member joined
        const roomCode = this.memberRoomService.getMemberRoom(socket.id);

        // check room
        if (!roomCode) {
            // error Message
            const errorMessage = {
                statusCode: 409,
                message: 'user_did_not_join_the_room',
            };

            socket.emit('room_error', errorMessage);
            socket.disconnect(true);
            return;
        }

        // peer id
        const { answerId } = offerICEcandidate;

        // send candidate list to the previosuly joined member 
        socket.to(answerId).emit('offercandidate', offerICEcandidate);
    }

    // subscribe answer candidate (answer member -> offer member)
    @SubscribeMessage('answercandidate')
    async handleAnswerCandidate(socket: any, answerICEcandidate: AnswerICECandidate) {
        // find which room the member joined
        const roomCode = this.memberRoomService.getMemberRoom(socket.id);

        // check room
        if (!roomCode) {
            // error Message
            const errorMessage = {
                statusCode: 409,
                message: 'user_did_not_join_the_room',
            };

            socket.emit('room_error', errorMessage);
            socket.disconnect(true);
            return;
        }

        // peer id
        const { offerId } = answerICEcandidate;

        // send candidate list to the previosuly joined member  
        socket.to(offerId).emit('answercandidate', answerICEcandidate);
    }

    // subscribe offer (offer member -> answer member)
    @SubscribeMessage('offer')
    async handleOffer(socket: any, offerSDPMessage: OfferSDPMessage) {
        // find which room the member joined
        const roomCode = this.memberRoomService.getMemberRoom(socket.id);

        // check room
        if (!roomCode) {
            // error Message
            const errorMessage = {
                statusCode: 409,
                message: 'user_did_not_join_the_room',
            };

            socket.emit('room_error', errorMessage);
            socket.disconnect(true);
            return;
        }

        // peer id
        const { answerId } = offerSDPMessage;

        // send offer to the previosuly joined member 
        socket.to(answerId).emit('offer', offerSDPMessage);
    }

    // subscribe answer (answer member -> offer member)
    @SubscribeMessage('answer')
    async handleAnswer(socket: any, answerSDPmessage: AnswerSDPMessage) {
        // find which room the member joined
        const roomCode = this.memberRoomService.getMemberRoom(socket.id);

        // check room
        if (!roomCode) {
             // error Message
             const errorMessage = {
                statusCode: 409,
                message: 'user_did_not_join_the_room',
            };

            socket.emit('room_error', errorMessage);
            socket.disconnect(true);
            return;
        }

        // offer id
        const { offerId } = answerSDPmessage;

        // send answer to the later joined member 
        socket.to(offerId).emit('answer', answerSDPmessage);
    }
}
