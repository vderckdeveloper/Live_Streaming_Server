import { Module } from '@nestjs/common';
import { MemberAssignService } from './memberAssign.service';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [RedisModule],
    providers: [MemberAssignService],
    exports: [MemberAssignService] 
})
export class MemberAssignModule { }