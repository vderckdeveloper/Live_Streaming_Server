import { Module } from '@nestjs/common';
import { RoomNameService } from './roomName.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [RoomNameService],
    exports: [RoomNameService] 
})
export class RoomNameModule { }