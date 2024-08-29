import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class MemberAssignService {
    private redisClientV4;

    constructor(private redisService: RedisService) { }

    async onModuleInit() {
        const redisClient = await this.redisService.getClient();
        this.redisClientV4 = redisClient.v4;
    }

    // assign individual id to a room member in the order of joining
    async AssignEachMemberToAnIndividualId(room: string, socketId: string): Promise<void> {
        const nameList = ['희망', '행복', '평화', '미소'];
        const roomNamesHash = `${room}_hash_names_key`; // Redis hash key
        const usedNamesSet = `${room}_used_names_key`; // Redis set key

        // Retrieve all names currently assigned in this room
        const usedNames = await this.redisClientV4.sMembers(usedNamesSet);

        // Determine available names by filtering out those already used
        const availableNames = nameList.filter(name => !usedNames.includes(name));

        let nameToAssign;
        if (availableNames.length > 0) {
            // If there are available names, pick the first available name in order
            nameToAssign = availableNames[0];
        } else {
            // If no available names and reassignment is allowed, reset and reuse all names
            await this.redisClientV4.del(usedNamesSet); // Reset used names
            nameToAssign = nameList[0]; // Start from the first name
        }

        // Assign the selected name to the socket ID in the hash
        await this.redisClientV4.hSet(roomNamesHash, socketId, nameToAssign);

        // Add the assigned name to the set of used names
        await this.redisClientV4.sAdd(usedNamesSet, nameToAssign);
    }

    async RemoveMemberOnDisconnect(room: string, socketId: string): Promise<void> {
        const roomNamesHash = `${room}_hash_names_key`; // Redis hash key for socketId to name mappings
        const usedNamesSet = `${room}_used_names_key`; // Redis set key for tracking used names

        // Fetch the name assigned to the socketId
        const assignedName = await this.redisClientV4.hGet(roomNamesHash, socketId);

        if (assignedName) {
            // Remove the socketId and its associated name from the hash
            await this.redisClientV4.hDel(roomNamesHash, socketId);

            // Optionally, remove the name from the set of used names if you want it to be reused immediately
            await this.redisClientV4.sRem(usedNamesSet, assignedName);
        }
    }

    // Retrieve the assigned user ID (or name) for a given room and socket ID
    async getAssignedUserId(room: string, socketId: string): Promise<string | null> {
        const roomNamesHash = `${room}_hash_names_key`; // Redis hash key for socketId to name mappings

        // Fetch the name assigned to the socketId from the hash
        const assignedName = await this.redisClientV4.hGet(roomNamesHash, socketId);

        return assignedName;
    }
}