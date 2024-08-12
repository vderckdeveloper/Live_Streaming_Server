import { Module } from '@nestjs/common';
import { MemberRoomService } from './memberRoom.service';

@Module({
    providers: [MemberRoomService],
    exports: [MemberRoomService] 
})
export class MemberRoomModule { }