import 'dotenv/config';
import { execSync, spawn } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { API_PORT, waitForApi } from './api';

function testDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error('Defina TEST_DATABASE_URL no .env (veja o .env.example).');
  if (url === process.env.DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL precisa apontar para um banco diferente do DATABASE_URL.');
  }
  return url;
}

// Banco de teste com as migrations e sem dados, e a API compilada rodando sobre ele
export default async function globalSetup(): Promise<void> {
  const databaseUrl = testDatabaseUrl();
  const env = { ...process.env, DATABASE_URL: databaseUrl, PORT: String(API_PORT) };

  execSync('npx prisma migrate deploy', { env, stdio: 'ignore' });
  const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
  await prisma.$executeRaw`TRUNCATE duelos_partida, partidas, escalacoes, transacoes, contratos, jogadores, clubes RESTART IDENTITY CASCADE`;
  await prisma.$disconnect();

  const server = spawn(process.execPath, ['dist/main.js'], { env, stdio: 'ignore' });
  process.env.E2E_API_PID = String(server.pid);
  await waitForApi();
}
