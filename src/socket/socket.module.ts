import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

import { RoomNameModule } from 'src/roomname/roomName.module';

@Module({
  imports: [RoomNameModule],
  providers: [SocketGateway],
})
export class SocketModule { }
