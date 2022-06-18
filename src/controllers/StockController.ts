import { Request, Response } from 'express';
import Parse from 'parse/node';

export default function Register(app: any) {
  app.get('/api/stock/getusers', async (req: Request, res: Response) => {
    const data = await new Parse.Query(Parse.User).limit(100).find();

    res.status(200).json(data);
  });
}
