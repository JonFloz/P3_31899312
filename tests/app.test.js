
const request = require('supertest');
const app = require('../app'); // Tu aplicación Express
const { AppDataSource } = require('../config/databaseConfig');
const Usuario = require('../models/usuario');
const Categoria = require('../models/Category');
const Tag = require('../models/Tag');
const Manga = require('../models/Product');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Seed: 10 usuarios, categorías, tags y mangas para toda la suite
beforeAll(async () => {
    await AppDataSource.initialize(); // Inicializar BD

    const userRepo = AppDataSource.getRepository(Usuario);
    const catRepo = AppDataSource.getRepository(Categoria);
    const tagRepo = AppDataSource.getRepository(Tag);
    const mangaRepo = AppDataSource.getRepository(Manga);

    // Limpiar BD a estado conocido
    await mangaRepo.clear();
    await tagRepo.clear();
    await catRepo.clear();
    await userRepo.clear();

    // Crear 10 usuarios con contraseñas conocidas y JWT permanentes
    global.__SEEDED_USERS = [];
    global.__SEEDED_TOKENS = [];
    for (let i = 1; i <= 10; i++) {
        const email = `seeduser${i}@example.com`;
        const nombre = `Seed User ${i}`;
        const plain = `Password${i}!`;
        const hashed = await bcrypt.hash(plain, 10);
        const user = userRepo.create({ nombre, email, contrasena: hashed });
        await userRepo.save(user);
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET); // sin expiración para tests
        global.__SEEDED_USERS.push({ id: user.id, email, plain });
        global.__SEEDED_TOKENS.push(token);
    }

    // Crear categoría y tags para los mangas seed
    const baseCat = catRepo.create({ name: 'SeedCat', description: 'Base category for seeded mangas' });
    await catRepo.save(baseCat);
    const t1 = tagRepo.create({ name: 'SeedTag1' });
    const t2 = tagRepo.create({ name: 'SeedTag2' });
    await tagRepo.save([t1, t2]);

    // Crear 10 mangas seed ligados a la categoría y tags
    for (let i = 1; i <= 10; i++) {
        const name = `Seed Manga ${i}`;
        const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${i}`;
        const m = mangaRepo.create({
            name,
            author: 'SeedAuthor',
            tomoNumber: i,
            publicationDate: '2020-01-01',
            price: 9.99,
            stock: 5,
            genre: 'Shounen',
            series: 'SeedSeries',
            illustrator: 'SeedArtist',
            slug,
            category: baseCat,
            tags: [t1, t2]
        });
        await mangaRepo.save(m);
    }
});

beforeEach(async () => {
    // Mantener datos seed entre pruebas
    // Tests usan tokens seed para autenticación
    console.log('Test setup - seeded data available');
});

afterAll(async () => {
    // Cerrar conexión al finalizar pruebas
    await AppDataSource.destroy();
});

describe('Pruebas de Endpoints de Autenticación', () => {
    
    it('POST /auth/register, se espera status 201 %% success, return: id, nombre, email.', async () => {
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                nombre: 'Alex',
                email: 'alex@hotmail.com',
                contrasena: 'Password' // campo 'contrasena'
            });

        expect(registerResponse.status).toBe(201);
        expect(registerResponse.body.status).toBe('success');
        expect(registerResponse.body.data).toHaveProperty('id');
        expect(registerResponse.body.data.nombre).toBe('Alex');
        expect(registerResponse.body.data.email).toBe('alex@hotmail.com');
    });

    it('POST /auth/register, se espera un error 409, Email ya se encuentra registrado en la base de dato. ', async () => {
    // Crear usuario previo
        await request(app)
            .post('/auth/register')
            .send({
                nombre: 'Alex',
                email: 'alex2@outlook.com',
                contrasena: 'password123' // campo 'contrasena'
            });

    // Intentar registrar correo duplicado
        const registerResponse = await request(app)
            .post('/auth/register')
            .send({
                nombre: 'Alex',
                email: 'alex2@outlook.com', // mismo email que antes
                contrasena: 'password123'
            });

    expect(registerResponse.status).toBe(409); // esperar 409 por duplicado
        expect(registerResponse.body.status).toBe('fail');
    });


    it('POST /auth/login, Se espera retornar status 200 && success, return Token', async () => {
    // Usar usuario seed creado en beforeAll para login
        const seeded = global.__SEEDED_USERS[0];
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: seeded.email, contrasena: seeded.plain });

        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body.status).toBe('success');
        expect(loginResponse.body).toHaveProperty('token');
    });

    it('POST /auth/login, Se espera un status 401 && fail, Credenciales invalidas: Email o contrasena no coinciden', async () => {
        const seeded = global.__SEEDED_USERS[0];
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: seeded.email, contrasena: 'wrong-password' });

        expect(loginResponse.status).toBe(401);
        expect(loginResponse.body.status).toBe('fail');
    });

    it('POST /auth/login, Se espera un status 400 && fail, Credenciales invalidas: No ingreso Email o contrasena', async () => {
        const seeded = global.__SEEDED_USERS[1];
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({ email: seeded.email, contrasena: '' });

        expect(loginResponse.status).toBe(400);
        expect(loginResponse.body.status).toBe('fail');
    });

    it('Get /users, se espera status 401 && fail, al no enviar token de autenticacion', async () => {
        const getAllUsersResponse = await request(app)
            .get('/users');

        expect(getAllUsersResponse.status).toBe(401);
        expect(getAllUsersResponse.body.status).toBe('fail');
    });

    it('Get /users, se espera status 403 && fail, Token no valido o expirado', async () => {

        token = 'abcdersdASDsfewaf';

        const getAllUsersResponse = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}invalid`);

        expect(getAllUsersResponse.status).toBe(403);
        expect(getAllUsersResponse.body.status).toBe('fail');
    });

    it('Get /users, se espera status 200 && success, con validacion de token, se recuperan todos los usuarios', async () => {
        const token = global.__SEEDED_TOKENS[0];
        const getAllUsersResponse = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${token}`);

        expect(getAllUsersResponse.status).toBe(200);
        expect(getAllUsersResponse.body.status).toBe('success');
        expect(typeof getAllUsersResponse.body.data).toBe('object');
    });


    it('Get /users/:id, se espera status 200 && success, con validacion de token, se recupera un usuario por ID', async () => {
        const seeded = global.__SEEDED_USERS[2];
        const token = global.__SEEDED_TOKENS[2];
        const userId = seeded.id;

        const getUserByIdResponse = await request(app)
            .get(`/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getUserByIdResponse.status).toBe(200);
        expect(getUserByIdResponse.body.status).toBe('success');
        expect(getUserByIdResponse.body.data).toHaveProperty('user');
        expect(getUserByIdResponse.body.data.user.id).toBe(userId);
        expect(getUserByIdResponse.body.data.user.email).toBe(seeded.email);
    });


    it('Get /users/:id, se espera status 404 && fail, al no encontrar el usuario por ID', async () => {
    // Usar token seed y un ID inexistente
        const token = global.__SEEDED_TOKENS[3];
        const getUserByIdResponse = await request(app)
            .get(`/users/999999`)
            .set('Authorization', `Bearer ${token}`);

        expect(getUserByIdResponse.status).toBe(404);
        expect(getUserByIdResponse.body.status).toBe('fail');
        expect(getUserByIdResponse.body.message).toBe('Usuario no encontrado');
    });

    it('Get /users/:id, se espera status 400 && fail, al no enviar un ID válido', async () => {
        const invalidUserId = 'abc123';
        const token = global.__SEEDED_TOKENS[4];
        const getUserByIdResponse = await request(app)
            .get(`/users/${invalidUserId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(getUserByIdResponse.status).toBe(400);
        expect(getUserByIdResponse.body.status).toBe('fail');
    });


    it('POST /users, se espera status 200 && success, Se crea un usuario con validacion de token', async () => {
        const token = global.__SEEDED_TOKENS[5];
        const createUserResponse = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${token}`)
            .send({ nombre: 'Maria', email: 'Maria@gmail.com', contrasena: 'Password123' });

        expect(createUserResponse.status).toBe(201);
        expect(createUserResponse.body.status).toBe('success');
        expect(createUserResponse.body.data.usuario).toHaveProperty('id');
        expect(createUserResponse.body.data.usuario.nombre).toBe('Maria');
        expect(createUserResponse.body.data.usuario.email).toBe('Maria@gmail.com');
    });

    it('POST /users, se espera status 409 && fail, Correo en uso', async () => {
        const token = global.__SEEDED_TOKENS[5];
        await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({ nombre: 'Maria', email: 'Maria@gmail.com', contrasena: 'Password123' });
        const createUserResponse = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({ nombre: 'Maria', email: 'Maria@gmail.com', contrasena: 'Password123' });
        expect(createUserResponse.status).toBe(409);
        expect(createUserResponse.body.status).toBe('fail');
    });

    it('POST /users, se espera status 400 && fail, No se ingreso algun dato, o el Email no tiene direccion correcta', async () => {
        const token = global.__SEEDED_TOKENS[6];
        const createUserResponse = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({ nombre: '', email: 'Maria@gmail.com', contrasena: 'Password123' });
        expect(createUserResponse.status).toBe(400);
        expect(createUserResponse.body.status).toBe('fail');
    });



    it('PUT /users/:id, se espera status 200 && success, Se actualiza un usuario con validación de token', async () => {
        const token = global.__SEEDED_TOKENS[7];
    // Crear usuario a actualizar mediante /users
        const createUserResponse = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({ nombre: 'Maria', email: `maria${Date.now()}@example.com`, contrasena: 'Password123' });
    const userId = createUserResponse.body.data.usuario.id; // id del usuario creado

    // Actualizar datos del usuario
        const updateUserResponse = await request(app).put(`/users/${userId}`).set('Authorization', `Bearer ${token}`).send({ nombre: 'Maria-Updated', email: `maria.updated${Date.now()}@example.com`, contrasena: 'NewPassword123' });

        expect(updateUserResponse.status).toBe(200);
        expect(updateUserResponse.body.status).toBe('success');
        expect(updateUserResponse.body.data).toHaveProperty('nombre', 'Maria-Updated');
        expect(updateUserResponse.body.data).toHaveProperty('email');
    });


    it('PUT /users/:id, se espera status 409 && fail, Correo ingresado ya esta en uso', async () => {
        const token = global.__SEEDED_TOKENS[7];
    // Crear dos usuarios: uno a actualizar y otro para conflicto de email
        const r1 = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({ nombre: 'U1', email: `u1${Date.now()}@example.com`, contrasena: 'Password1' });
        const r2 = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({ nombre: 'U2', email: `u2${Date.now()}@example.com`, contrasena: 'Password2' });
        const userId = r1.body.data.usuario.id;
        const conflictEmail = r2.body.data.usuario.email;
        const updateUserResponse = await request(app).put(`/users/${userId}`).set('Authorization', `Bearer ${token}`).send({ nombre: 'X', email: conflictEmail, contrasena: 'NewPassword123' });
        expect(updateUserResponse.status).toBe(409);
        expect(updateUserResponse.body.status).toBe('fail');
    });


    it('PUT /users/:id, se espera status 404 && fail, al no encontrar el usuario', async () => {
        const token = global.__SEEDED_TOKENS[8];
        const nonExistentUserId = 999999;
        const updateUserResponse = await request(app).put(`/users/${nonExistentUserId}`).set('Authorization', `Bearer ${token}`).send({ nombre: 'Maria-Updated', email: 'maria.updated@gmail.com', contrasena: 'NewPassword123' });
        expect(updateUserResponse.status).toBe(404);
        expect(updateUserResponse.body.status).toBe('fail');
    });


        // Prueba: eliminar usuario existente
    it('DELETE /users/:id, se espera status 200 && success, al eliminar un usuario', async () => {
        const token = global.__SEEDED_TOKENS[9];
        const createUserResponse = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({ nombre: 'Maria', email: `maria.del${Date.now()}@example.com`, contrasena: 'Password123' });
        const userId = createUserResponse.body.data.usuario.id;
        const deleteUserResponse = await request(app).delete(`/users/${userId}`).set('Authorization', `Bearer ${token}`);
        expect(deleteUserResponse.status).toBe(200);
        expect(deleteUserResponse.body.status).toBe('success');
    });

    // Prueba: eliminar usuario inexistente
    it('DELETE /users/:id, se espera status 404 && fail, al no encontrar el usuario para eliminar', async () => {
        const token = global.__SEEDED_TOKENS[0];
        const nonExistentUserId = 999999;
        const deleteUserResponse = await request(app).delete(`/users/${nonExistentUserId}`).set('Authorization', `Bearer ${token}`);
        expect(deleteUserResponse.status).toBe(404);
        expect(deleteUserResponse.body.status).toBe('fail');
    });

});

// --- Pruebas extendidas (Task 2) ---
// Reusar inicialización y datos seed

describe('Task 2 - Extended robustness tests (categories, tags, products)', () => {
    // auxiliares y estado
    let createdCategory;
    let createdTag1;
    let createdTag2;
    let createdProduct;

    // helper: devolver un token seed para endpoints protegidos
    async function createAndLogin() {
        if (!global.__SEEDED_TOKENS || global.__SEEDED_TOKENS.length === 0) {
            throw new Error('Seeded tokens are not available');
        }
    // elegir token seed aleatorio
        const token = global.__SEEDED_TOKENS[Math.floor(Math.random() * global.__SEEDED_TOKENS.length)];
        return token;
    }

    test('Categories CRUD: protected endpoints reject without token', async () => {
        const res = await request(app).post('/v2/categories').send({ name: 'NoAuthCat' });
        expect([401, 403]).toContain(res.status);
    });

    test('Tags CRUD: protected endpoints reject without token', async () => {
        const res = await request(app).post('/v2/tags').send({ name: 'NoAuthTag' });
        expect([401, 403]).toContain(res.status);
    });

    test('Create category (protected) and validate JSend', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();

        const res = await request(app)
            .post('/v2/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `CI Category ${Date.now()}`, description: 'Category for tests' });

            if (res.status !== 201) {
                console.error('Create category response body:', res.body);
            }
            expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('status', 'success');
        createdCategory = res.body.data;
        expect(createdCategory).toHaveProperty('id');
    });

    test('Create tags (protected) and validate JSend', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();

        const r1 = await request(app)
            .post('/v2/tags')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `CI Tag 1 ${Date.now()}` });
            if (r1.status !== 201) console.error('Create tag1 response body:', r1.body);
            expect(r1.status).toBe(201);
        createdTag1 = r1.body.data;

        const r2 = await request(app)
            .post('/v2/tags')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: `CI Tag 2 ${Date.now()}` });
        expect(r2.status).toBe(201);
        createdTag2 = r2.body.data;
    });

    test('Protected manga endpoints fail without token', async () => {
        const createRes = await request(app).post('/v2/mangas').send({ name: 'x' });
        expect([401, 403]).toContain(createRes.status);

        const getRes = await request(app).get('/v2/mangas/1');
        expect([401, 403]).toContain(getRes.status);

        const putRes = await request(app).put('/v2/mangas/1').send({ name: 'x2' });
        expect([401, 403]).toContain(putRes.status);

        const delRes = await request(app).delete('/v2/mangas/1');
        expect([401, 403]).toContain(delRes.status);
    });

    test('Create product (protected) with categoryId and tags', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();

    // asegurar categoría y tags disponibles
        if (!createdCategory) {
            const c = await request(app)
                .post('/v2/categories')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: `CI Category ${Date.now()}`, description: 'Category for product' });
            createdCategory = c.body.data;
        }

        if (!createdTag1) {
            const t1 = await request(app)
                .post('/v2/tags')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: `CI Tag A ${Date.now()}` });
            createdTag1 = t1.body.data;
        }
        if (!createdTag2) {
            const t2 = await request(app)
                .post('/v2/tags')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: `CI Tag B ${Date.now()}` });
            createdTag2 = t2.body.data;
        }

        const payload = {
            name: `CI Manga ${Date.now()}`,
            author: 'CIAuthor',
            tomoNumber: 1,
            publicationDate: '2020-01-01',
            price: 19.99,
            stock: 7,
            genre: 'Shounen',
            series: 'CISeries',
            illustrator: 'CIArtist',
            categoryId: createdCategory.id,
            tags: [createdTag1.id, createdTag2.id]
        };

        const res = await request(app)
            .post('/v2/mangas')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('slug');
        createdProduct = res.body.data;
    });

    test('Protected GET /v2/mangas/:id returns manga with token', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();
        const res = await request(app)
            .get(`/v2/mangas/${createdProduct.id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'success');
        expect(res.body.data).toHaveProperty('id', createdProduct.id);
    });

    test('Protected PUT /v2/mangas/:id updates manga and slug when name changes', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();

        const res = await request(app)
            .put(`/v2/mangas/${createdProduct.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'CI Manga Renamed', price: 29.99 });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('name', 'CI Manga Renamed');
        expect(res.body.data).toHaveProperty('price', 29.99);
        expect(res.body.data).toHaveProperty('slug');
        createdProduct = res.body.data;
    });

    test('Public GET /v2/mangas supports pagination and filters (no token)', async () => {
        const listRes = await request(app).get('/v2/mangas').query({ page: 1, limit: 10 });
        expect(listRes.status).toBe(200);
        expect(listRes.body).toHaveProperty('status', 'success');
        expect(Array.isArray(listRes.body.data.items)).toBe(true);

    // filtrar por id de categoría
    const catFilter = await request(app).get('/v2/mangas').query({ category: createdCategory.id });
        expect(catFilter.status).toBe(200);

    // filtrar por nombre de categoría
    const catByName = await request(app).get('/v2/mangas').query({ category: createdCategory.name });
        expect(catByName.status).toBe(200);

    // filtrar por tags
    const tagsFilter = await request(app).get('/v2/mangas').query({ tags: `${createdTag1.id},${createdTag2.id}` });
        expect(tagsFilter.status).toBe(200);

    // rango de precio
    const priceFilter = await request(app).get('/v2/mangas').query({ price_min: 1, price_max: 100 });
        expect(priceFilter.status).toBe(200);

    // búsqueda
    const searchFilter = await request(app).get('/v2/mangas').query({ search: 'Renamed' });
        expect(searchFilter.status).toBe(200);

    // filtros personalizados
        const customFilter = await request(app).get('/v2/mangas').query({ author: 'CIAuthor', genre: 'Shounen', series: 'CISeries' });
        expect(customFilter.status).toBe(200);
    });

    test('Public GET /v2/p/:id-:slug returns manga and redirects 301 when slug wrong', async () => {
    // slug correcto
        const ok = await request(app).get(`/v2/p/${createdProduct.id}-${createdProduct.slug}`);
        expect(ok.status).toBe(200);
        expect(ok.body.data).toHaveProperty('id', createdProduct.id);

    // slug incorrecto
        const wrongSlug = 'wrong-slug-ci';
        const bad = await request(app).get(`/v2/p/${createdProduct.id}-${wrongSlug}`).redirects(0);
        expect(bad.status).toBe(301);
        expect(bad.headers).toHaveProperty('location');
        expect(bad.headers.location).toMatch(new RegExp(`/v2/p/${createdProduct.id}-`));
    });

    test('Protected DELETE /v2/products/:id deletes product', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();
        const del = await request(app)
            .delete(`/v2/mangas/${createdProduct.id}`)
            .set('Authorization', `Bearer ${token}`);
        expect(del.status).toBe(200);
        expect(del.body).toHaveProperty('status', 'success');
    });

    test('Cleanup tags and category (protected)', async () => {
        const token = await createAndLogin();
        expect(token).toBeTruthy();

        if (createdTag1) {
            const d1 = await request(app)
                .delete(`/v2/tags/${createdTag1.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect([200, 204]).toContain(d1.status);
        }

        if (createdTag2) {
            const d2 = await request(app)
                .delete(`/v2/tags/${createdTag2.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect([200, 204]).toContain(d2.status);
        }

        if (createdCategory) {
            const dc = await request(app)
                .delete(`/v2/categories/${createdCategory.id}`)
                .set('Authorization', `Bearer ${token}`);
            expect([200, 204]).toContain(dc.status);
        }
    });
});
// --- fin pruebas extendidas ---

