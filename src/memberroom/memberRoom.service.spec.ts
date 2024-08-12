import { Test, TestingModule } from '@nestjs/testing';
import { MemberRoomService } from './memberRoom.service';

describe('MemberRoomService', () => {
  let service: MemberRoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberRoomService],
    }).compile();

    service = module.get<MemberRoomService>(MemberRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setRoom', () => {
    it('should correctly map a socket ID to a room', () => {
      service.setMemberRoom('socket1', 'room1');
      expect(service.getMemberRoom('socket1')).toEqual('room1');
    });
  });

  describe('getRoom', () => {
    it('should return undefined if the socket ID is not mapped', () => {
      expect(service.getMemberRoom('nonexistent')).toBeUndefined();
    });
  });

  describe('deleteRoom', () => {
    it('should remove the socket ID from the mapping', () => {
      service.setMemberRoom('socket1', 'room1');
      service.deleteMemberRoom('socket1');
      expect(service.getMemberRoom('socket1')).toBeUndefined();
    });
  });

  describe('hasRoom', () => {
    it('should return true if the socket ID is in the mapping', () => {
      service.setMemberRoom('socket1', 'room1');
      expect(service.hasMemberRoom('socket1')).toBe(true);
    });

    it('should return false if the socket ID is not in the mapping', () => {
      expect(service.hasMemberRoom('nonexistent')).toBe(false);
    });
  });
});