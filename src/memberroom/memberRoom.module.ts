import { Module } from '@nestjs/common';
import { MemberRoomService } from './memberRoom.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [MemberRoomService],
    exports: [MemberRoomService] 
})
export class MemberRoomModule { }