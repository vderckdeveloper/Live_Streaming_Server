// Importing necessary NestJS and socket.io classes
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

// Define a new class redis adapter for redis connection
export class RedisAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>; // Store the Redis adapter constructor 
  private configService: ConfigService;

  // Constructor to initialize the adapter with a session middleware and application context
  constructor(app: INestApplicationContext, configService: ConfigService) {
    super(app);
    this.configService = configService;
  }

  // Async method to initialize Redis clients and the adapter for Redis
  async initializeAdapter() {
    const REDIS_HOST = this.configService.get<string>('REDIS_HOST');
    const REDIS_PORT = this.configService.get<number>('REDIS_PORT');
    const pubClient = createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` }); // Create a Redis client for publishing

    const subClient = pubClient.duplicate();

    await Promise.all([
      pubClient.connect(),
      subClient.connect()
    ]);

    // initialize the adapter with redis
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  // Method to create a new socket.io server and attach the Redis adapter after ensuring it is initialized
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    // If the adapter is not initialized, throw an error
    if (!this.adapterConstructor) {
      throw new Error('Adapter must be initialized before creating the server.');
    }

    // Set the server's adapter to the initialized Redis adapter
    server.adapter(this.adapterConstructor);

    return server;
  }
}