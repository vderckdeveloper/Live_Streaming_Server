import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomNameService {
    private roomName: { [room: string]: string[] } = {};

    setRoom(room: string, socketId: string): void {
        // If the room doesn't exist, create it with an empty array, then add the member
        if (!this.roomName[room]) {
            this.roomName[room] = [];
        }
        this.roomName[room].push(socketId);
    }

    getRoom(room: string): string[] | undefined {
        return this.roomName[room];
    }

    deleteRoom(room: string): void {
        delete this.roomName[room];
    }

    hasRoom(room: string): boolean {
        return this.roomName.hasOwnProperty(room);
    }

    removeMember(room: string, socketId: string): void {
        if (this.roomName[room]) {
            this.roomName[room] = this.roomName[room].filter(item => item !== socketId);

            // If the room is now empty, remove it entirely
            if (this.roomName[room].length === 0) {
                this.deleteRoom(room);
            }
        }
    }

    getMembers(room: string): string[] {
        return this.roomName[room] || [];
    }
}