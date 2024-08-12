import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [],
  providers: [SocketGateway],
})
export class SocketModule { }
