import { Application, Request, Response } from 'express';

export default (app: Application) => {
  app.get('/api/auth', (req: Request, res: Response) => {
    res.send('<h1>AUTH TEST</h1>');
  });
};
