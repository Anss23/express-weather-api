import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Weather API',
    description: 'A simple weather forecast API using National Weather Service data',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  basePath: '/',
  produces: ['application/json'],
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Weather',
      description: 'Weather forecast endpoints'
    }
  ]
};

const outputFile = '../src/swagger-output.json';
const endpointsFiles = ['./src/routes.ts'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully!');
});