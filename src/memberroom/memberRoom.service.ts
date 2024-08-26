import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class MemberRoomService {
    private redisClientV4;

    constructor(private redisService: RedisService) { }

    async onModuleInit() {
        const redisClient = await this.redisService.getClient();
        this.redisClientV4 = redisClient.v4;
    }

    // Set or update the room with a value
    async setMemberRoom(socket: string, room: string): Promise<void> {
        await this.redisClientV4.set(socket, room);
    }

    // Retrieve the value of the room
    async getMemberRoom(socket: string): Promise<string | null> {
        return await this.redisClientV4.get(socket);
    }

    // Delete a room entry
    async deleteMemberRoom(socket: string): Promise<void> {
        await this.redisClientV4.del(socket);
    }

    // Check if the room exists
    async hasMemberRoom(socket: string): Promise<boolean> {
        const result = await this.redisClientV4.exists(socket);
        return result === 1;
    }
}