import { PrismaClient } from '@prisma/client';
import { Application, Request, Response } from 'express';

const prismaClient = new PrismaClient();

export default function Register(app: Application) {
  app.get('/api/stock/getusers', async (req: Request, res: Response) => {
    const data = await prismaClient.user.findMany({ take: 100 });

    res.status(200).json(data);
  });
}
