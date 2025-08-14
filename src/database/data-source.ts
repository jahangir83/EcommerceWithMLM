import { DataSource } from 'typeorm';
import { UserProfile, User } from '~/entity/index';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, UserProfile],
  // migrations: ["src/database/migrations/*.ts"],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
});
