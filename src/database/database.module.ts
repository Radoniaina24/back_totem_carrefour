import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://carrefour:FullStack-2024@carrefour.z1pm5nr.mongodb.net/totem_carrefour?appName=carrefour',
    ),
  ],
})
export class DatabaseModule {}

//mongodb+srv://carrefour:Gate07Nov2011@admin@carrefour.z1pm5nr.mongodb.net/totem_carrefour?retryWrites=true&w=majority&appName=carrefour
