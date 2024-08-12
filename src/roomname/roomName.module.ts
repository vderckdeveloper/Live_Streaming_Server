import { Module } from '@nestjs/common';
import { RoomNameService } from './roomName.service';

@Module({
    providers: [RoomNameService],
    exports: [RoomNameService] 
})
export class RoomNameModule { }