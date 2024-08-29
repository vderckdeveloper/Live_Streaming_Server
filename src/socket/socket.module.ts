import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

// room name module
import { RoomNameModule } from 'src/roomname/roomName.module';

// member room module
import { MemberRoomModule } from 'src/memberroom/memberRoom.module';

// member assign module
import { MemberAssignModule } from 'src/memberassign/memberAssign.module';

@Module({
  imports: [RoomNameModule, MemberRoomModule, MemberAssignModule],
  providers: [SocketGateway],
})
export class SocketModule { }
