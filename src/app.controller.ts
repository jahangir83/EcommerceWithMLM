import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getRoot(@Res() res: Response): void {
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AIT-backend</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
              padding: 40px;
              text-align: center;
            }
            h1 {
              color: #2c3e50;
            }
            p {
              color: #555;
            }
          </style>
        </head>
        <body>
          <h1>Welcome to AIT-backend 🚀</h1>
          <p>The API is running successfully.</p>
          <p><strong>${new Date().toLocaleString()}</strong></p>
        </body>
      </html>
    `);
  }
}
