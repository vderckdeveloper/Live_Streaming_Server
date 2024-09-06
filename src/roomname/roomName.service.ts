import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RoomNameService {
    private redisClientV4;

    constructor(private redisService: RedisService) { }

    async onModuleInit() {
        const redisClient = await this.redisService.getClient();
        this.redisClientV4 = redisClient.v4;
    }

    // Add a member to a room
    async setRoom(room: string, socketId: string): Promise<void> {
        await this.redisClientV4.sAdd(room, socketId);
    }

    // Get all members of a room
    async getRoom(room: string): Promise<string[]> {
        return await this.redisClientV4.sMembers(room);
    }

    // Delete a room entirely
    async deleteRoom(room: string): Promise<void> {
        await this.redisClientV4.del(room);
    }

    // Check if the room exists
    async hasRoom(room: string): Promise<boolean> {
        const result = await this.redisClientV4.exists(room);
        return result === 1;
    }

    // Remove a member from a room
    async removeMember(room: string, socketId: string): Promise<void> {
        await this.redisClientV4.sRem(room, socketId);

        // If the room is now empty, remove it entirely
        const membersCount = await this.redisClientV4.sCard(room);
        if (membersCount === 0) {
            await this.redisClientV4.del(room);
        }
    }

    // Get all members of a room
    async getMembers(room: string): Promise<string[]> {
        return await this.redisClientV4.sMembers(room);
    }
}
