import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('jenkins pipe line test');
    return 'Hello World!';
  }
}
