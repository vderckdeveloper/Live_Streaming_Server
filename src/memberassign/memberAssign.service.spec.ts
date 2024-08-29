import { Test, TestingModule } from '@nestjs/testing';
import { MemberAssignService } from './memberAssign.service';

describe('MemberAssignService', () => {
  let service: MemberAssignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberAssignService],
    }).compile();

    service = module.get<MemberAssignService>(MemberAssignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setRoom', () => {
    it('should correctly map a socket ID to a room', () => {
      service.setRoom('socket1', 'room1');
      expect(service.getRoom('socket1')).toEqual('room1');
    });
  });

  describe('getRoom', () => {
    it('should return undefined if the socket ID is not mapped', () => {
      expect(service.getRoom('nonexistent')).toBeUndefined();
    });
  });

  describe('deleteRoom', () => {
    it('should remove the socket ID from the mapping', () => {
      service.setRoom('socket1', 'room1');
      service.deleteRoom('socket1');
      expect(service.getRoom('socket1')).toBeUndefined();
    });
  });

  describe('hasRoom', () => {
    it('should return true if the socket ID is in the mapping', () => {
      service.setRoom('socket1', 'room1');
      expect(service.hasRoom('socket1')).toBe(true);
    });

    it('should return false if the socket ID is not in the mapping', () => {
      expect(service.hasRoom('nonexistent')).toBe(false);
    });
  });
});