export default (app: any) => {
  app.get('/api/auth', (req: any, res: any) => {
    res.send('<h1>AUTH TEST</h1>');
  });
};
