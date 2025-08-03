import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Login Instagram Clone',
      version: '1.0.0',
      description: 'Dokumentasi untuk API backend yang menyimpan data login.',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Server Development Lokal',
      },
    ],
  },
  // Path ke file yang berisi komentar @swagger
  apis: ['./src/index.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;