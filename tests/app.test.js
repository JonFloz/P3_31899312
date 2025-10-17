const request = require('supertest');
const app = require('../app'); 

describe('Test API Endpoints', () => {
    it('GET /about Se espera retornar status 200 con informacion en formato Jsend', async () => {
        const response = await request(app).get('/about');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: "success",
            data: {
                nombreCompleto: "Edgar Alexander Herrera Milano",
                cedula: "V31899312",
                seccion: "1"
            }
        });
    });

    it('GET /ping Se espera un retorno de status 200', async () => {
        const response = await request(app).get('/ping');
        expect(response.status).toBe(200);
        expect(response.text).toBe('OK'); 
    });
});
///// comit

let server;

beforeAll(() => {
  server = require('../app'); 
});

afterAll(() => {
  server.close();
});

let prueba = true