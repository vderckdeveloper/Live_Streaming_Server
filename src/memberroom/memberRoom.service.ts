import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberRoomService {
    private memberRoomName: Map<string, string> = new Map();

    // Set or update the room with a value
    setMemberRoom(socket: string, room: string): void {
        this.memberRoomName.set(socket, room);
    }

    // Retrieve the value of the room
    getMemberRoom(socket: string): string | undefined {
        return this.memberRoomName.get(socket);
    }

    // Delete a room entry
    deleteMemberRoom(socket: string): void {
        this.memberRoomName.delete(socket);
    }

    // Check if the room exists
    hasMemberRoom(socket: string): boolean {
        return this.memberRoomName.has(socket);
    }
}