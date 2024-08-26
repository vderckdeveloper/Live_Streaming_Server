import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redis from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
    private redisClient: redis.RedisClientType;

    constructor(private configService: ConfigService) { }

    async onModuleInit() {
        this.redisClient = redis.createClient({
            legacyMode: true,
            socket: {
                host: this.configService.get<string>('REDIS_HOST'),
                port: this.configService.get<number>('REDIS_PORT')
            },
            password: this.configService.get<string>('REDIS_PASSWORD')
        });

        this.redisClient.on('connect', () => { });

        this.redisClient.on('error', err => {
            console.log('Error ' + err);
        });

        await this.redisClient.connect();
    }

    getClient(): redis.RedisClientType {
        return this.redisClient;
    }
}