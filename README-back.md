# Informe Técnico — Scholar Sync API

**Curso:** Computación en Internet III — Ingeniería de Sistemas  
**Universidad:** ICESI  
**Fecha de entrega:** 26 de abril de 2026  
**Docente:** Kevin Rodriguez

**Deployment link (Apagado para no consumir créditos):** https://taller-nest-teamangular-production-ccf9.up.railway.app

---

## Tabla de Contenido

1. [Descripción General del Proyecto](#1-descripción-general-del-proyecto)
2. [Tecnologías Utilizadas](#2-tecnologías-utilizadas)
3. [Persistencia en Base de Datos — TypeORM](#3-persistencia-en-base-de-datos--typeorm)
4. [Seed — Carga Inicial de Datos](#4-seed--carga-inicial-de-datos)
5. [Autenticación — JWT](#5-autenticación--jwt)
6. [Autorización — Roles y Permisos](#6-autorización--roles-y-permisos)
7. [Endpoints de la API](#7-endpoints-de-la-api)
    - [Auth](#71-auth)
    - [Users](#72-users)
    - [Roles](#73-roles)
    - [Permissions](#74-permissions)
    - [User Roles](#75-user-roles)
    - [Role Permissions](#76-role-permissions)
    - [Courses](#77-courses)
    - [User Courses](#78-user-courses)
    - [Experience Badges](#79-experience-badges)
    - [User Badges](#710-user-badges)
    - [Posts](#711-posts)
    - [Replies](#712-replies)
    - [Supplementary Sessions](#713-supplementary-sessions)
    - [Attendance Supplementary Sessions](#714-attendance-supplementary-sessions)
8. [Pruebas](#8-pruebas)

---

## 1. Descripción General del Proyecto

**Scholar Sync** es una plataforma backend académica desarrollada con NestJS que permite gestionar usuarios, cursos, roles, permisos, sesiones de apoyo, insignias de experiencia y un foro de preguntas y respuestas. La API está diseñada para soportar múltiples roles (Admin, Student, TA, Professor) con control de acceso granular basado en permisos.

### Estructura del Proyecto

```
src/
├── auth/               → Autenticación (JWT, login/logout), usuarios, roles, permisos
├── badge/              → Insignias de experiencia y asignación a usuarios
├── course/             → Cursos y matrícula de usuarios
├── interaction/        → Foro: posts y respuestas
└── supplementary-session/ → Sesiones de apoyo y asistencia
```

---

## 2. Tecnologías Utilizadas

| Tecnología                  | Versión | Uso                         |
| --------------------------- | ------- | --------------------------- |
| NestJS                      | ^10     | Framework principal         |
| TypeORM                     | ^0.3    | ORM para PostgreSQL         |
| PostgreSQL                  | 16      | Base de datos relacional    |
| JWT (`@nestjs/jwt`)         | ^10     | Autenticación con tokens    |
| Passport (`passport-jwt`)   | ^4      | Estrategia de autenticación |
| bcrypt                      | ^5      | Hash seguro de contraseñas  |
| class-validator             | ^0.14   | Validación de DTOs          |
| Swagger (`@nestjs/swagger`) | ^11     | Documentación interactiva   |
| Jest                        | ^29     | Pruebas unitarias           |
| Supertest                   | ^6      | Pruebas de integración E2E  |
| Docker Compose              | —       | Contenedor de PostgreSQL    |

---

## 3. Persistencia en Base de Datos — TypeORM

### Configuración

La conexión a la base de datos se configura en `app.module.ts` mediante `TypeOrmModule.forRootAsync`, usando variables de entorno cargadas por `ConfigModule`:

```typescript
TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
        type: configService.get<SupportedDbTypes>('DB_TYPE') ?? 'postgres',
        host: configService.get<string>('DB_HOST') ?? 'localhost',
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/../**/*.entity.js'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
    }),
}),
```

### Variables de Entorno Requeridas (`.env`)

```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_DATABASE=scholar_sync
DB_SYNCHRONIZE=true
JWT_SECRET=superSecretKey123
JWT_EXPIRES_IN=1h
```

### Modelo de Datos

El esquema cuenta con **13 entidades** que se relacionan entre sí:

| Entidad                 | Tabla                      | Descripción                                       |
| ----------------------- | -------------------------- | ------------------------------------------------- |
| `User`                  | `users`                    | Usuarios de la plataforma                         |
| `Role`                  | `roles`                    | Roles del sistema (Admin, Student, TA, Professor) |
| `Permission`            | `permissions`              | Permisos (Create, Read, Update, Delete)           |
| `UserRole`              | `users_roles`              | Tabla intermedia Usuario ↔ Rol                    |
| `RolePermission`        | `roles_permissions`        | Tabla intermedia Rol ↔ Permiso                    |
| `Course`                | `courses`                  | Cursos académicos                                 |
| `UserCourse`            | `users_courses`            | Tabla intermedia Usuario ↔ Curso                  |
| `ExperienceBadge`       | `experience_badges`        | Tipos de insignias                                |
| `UserBadge`             | `users_badges`             | Insignias asignadas a usuarios                    |
| `Post`                  | `posts`                    | Publicaciones del foro                            |
| `Reply`                 | `replies`                  | Respuestas a publicaciones (auto-referencial)     |
| `SupplementarySession`  | `supplementary_sessions`   | Sesiones de apoyo académico                       |
| `AttendanceSuppSession` | `attendance_supp_sessions` | Asistencia a sesiones de apoyo                    |

### Estrategia de Relaciones M:N

En lugar de usar `@ManyToMany` nativo de TypeORM, se optó por **entidades intermedias explícitas** (`UserRole`, `RolePermission`, `UserCourse`) para tener control total sobre las tablas intermedias, poder hacer CRUD sobre ellas y, en el caso de `UserCourse`, agregar columnas adicionales como `relationType`.

### Inyección de Repositorios

Cada módulo registra sus entidades con `TypeOrmModule.forFeature([...])` y los services inyectan los repositorios mediante `@InjectRepository`:

```typescript
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}
}
```

---

## 4. Seed — Carga Inicial de Datos

El archivo `inserts.sql` contiene los registros iniciales para desarrollo y pruebas. Se ejecuta directamente sobre la base de datos PostgreSQL.

### Datos del Seed

| Entidad           | Registros | Detalle                                                   |
| ----------------- | --------- | --------------------------------------------------------- |
| Usuarios          | 5         | alice, bob, carol, dave (Admin), eve                      |
| Roles             | 2         | Admin, Student _(TA y Professor libres para POST)_        |
| Permisos          | 2         | Create, Read _(Update y Delete libres para POST)_         |
| Cursos            | 5         | Intro SE, Biology 101, Calculus I, Physics I, Chemistry I |
| Roles asignados   | 4         | alice/bob/carol → Student, dave → Admin                   |
| Insignias         | 5         | Novice, Learner, Intermediate, Advanced, Expert           |
| Sesiones de apoyo | 3         | Extra help 1, 2 y 3                                       |
| Posts             | 3         | Publicaciones del foro                                    |

### Contraseñas del Seed

Todos los usuarios tienen la contraseña `Password123`. El hash fue generado con:

```bash
node -e "require('bcrypt').hash('Password123', 10).then(console.log)"
# $2b$10$R97gWO76R5TgXjRhl6jji.kxSRC0K8PhBkLAOfMfskAc1AMZHBz/2
```

### Cómo Ejecutar el Seed

```bash
# 1. Levantar la base de datos con Docker
docker-compose up -d

# 2. Aplicar el seed
psql -h localhost -U postgres -d scholar_sync -f inserts.sql
```

---

## 5. Autenticación — JWT

### Implementación

La autenticación se implementó con **JSON Web Tokens (JWT)** usando `@nestjs/jwt` y `passport-jwt`. El sistema es **stateless**: el servidor no guarda sesiones; toda la información del usuario se codifica en el token.

### Flujo de Autenticación

```
Cliente                          Servidor
  │                                 │
  │  POST /auth/login               │
  │  { email, password }  ────────► │
  │                                 │  1. Busca usuario por email
  │                                 │  2. bcrypt.compare(password, hash)
  │                                 │  3. Extrae roles y permisos
  │                                 │  4. jwtService.sign(payload)
  │  { access_token: "eyJ..." } ◄── │
  │                                 │
  │  GET /courses                   │
  │  Authorization: Bearer eyJ... ► │
  │                                 │  5. JwtStrategy.validate()
  │                                 │  6. Carga usuario con relaciones
  │                                 │  7. req.user = User
  │  [{ id: 1, name: "Intro SE" }] ◄│
```

### Payload del Token

```json
{
    "sub": 4,
    "email": "dave@example.com",
    "roles": ["Admin"],
    "permissions": ["Create", "Read"],
    "iat": 1745700000,
    "exp": 1745703600
}
```

### Archivos Clave

| Archivo                | Responsabilidad                                                          |
| ---------------------- | ------------------------------------------------------------------------ |
| `auth.service.ts`      | Lógica de login: verificar credenciales, construir payload, firmar token |
| `auth.controller.ts`   | Endpoints `POST /auth/login` y `POST /auth/logout`                       |
| `jwt.strategy.ts`      | Valida el token en cada request y carga el usuario desde la BD           |
| `auth-login.module.ts` | Configura `JwtModule` con `JWT_SECRET` y `JWT_EXPIRES_IN` del `.env`     |
| `user-login.dto.ts`    | Valida que el body tenga email válido y contraseña de 8-30 caracteres    |

### Seguridad de Contraseñas con bcrypt

Las contraseñas nunca se guardan en texto plano. Se usa `bcrypt.hash()` con 10 salt rounds al crear o actualizar usuarios, y `bcrypt.compare()` al hacer login:

```typescript
// Al crear: hashear antes de guardar
const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

// Al hacer login: comparar con el hash de la BD
const passwordMatches = await bcrypt.compare(plainPassword, user.password);
```

---

## 6. Autorización — Roles y Permisos

### Roles Disponibles

| Rol         | Descripción                                      |
| ----------- | ------------------------------------------------ |
| `Admin`     | Acceso total a todas las rutas de administración |
| `Student`   | Puede leer recursos y participar en el foro      |
| `TA`        | Puede gestionar sesiones de apoyo                |
| `Professor` | Puede gestionar cursos y sesiones de apoyo       |

### Permisos Disponibles

| Permiso  | Descripción               |
| -------- | ------------------------- |
| `Create` | Puede crear recursos      |
| `Read`   | Puede leer recursos       |
| `Update` | Puede actualizar recursos |
| `Delete` | Puede eliminar recursos   |

### Guards Implementados

**`JwtAuthGuard`** — Verifica que el request tenga un token JWT válido. Retorna `401` si no hay token o es inválido.

**`RolesGuard`** — Lee el decorador `@Roles(...)` de la ruta y verifica que el usuario tenga al menos uno de los roles requeridos. Retorna `403` si no tiene el rol.

**`PermissionsGuard`** — Lee el decorador `@Permissions(...)` y verifica que el usuario tenga todos los permisos requeridos (aplanando los permisos de todos sus roles). Retorna `403` si no tiene los permisos.

### Ejemplo de Protección de Rutas

```typescript
// Solo Admin puede borrar usuarios
@Delete(':id')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin')
remove(@Param('id', ParseIntPipe) id: number) { ... }

// Solo Professor o TA pueden validar respuestas
@Patch(':id/validate')
@Roles(RoleNames.PROFESSOR, RoleNames.TA)
validate(@Param('id', ParseIntPipe) id: number) { ... }
```

### Asignación de Roles

Los roles se asignan a usuarios mediante el endpoint `POST /user-role`, accesible solo para usuarios con rol `Admin`. Esto garantiza que la asignación de roles sea un proceso administrativo controlado.

---

## 7. Endpoints de la API

> **Base URL:** `http://localhost:3000`  
> **Documentación interactiva:** `http://localhost:3000/api` (Swagger UI)  
> Los endpoints marcados con Requiere auth requieren `Authorization: Bearer <token>` en el header.  
> Los endpoints marcados con Admin requieren además el rol **Admin**.

---

### 7.1 Auth

| Método | Ruta           | Auth          | Descripción                                     |
| ------ | -------------- | ------------- | ----------------------------------------------- |
| `POST` | `/auth/login`  | Pública       | Iniciar sesión y obtener token JWT              |
| `POST` | `/auth/logout` | Requiere auth | Cerrar sesión (invalida el token en el cliente) |

#### `POST /auth/login`

**Body:**

```json
{
    "email": "dave@example.com",
    "password": "Password123"
}
```

**Respuestas:**

| Código | Descripción                                                          |
| ------ | -------------------------------------------------------------------- |
| `200`  | Login exitoso. Retorna `{ "access_token": "eyJ..." }`                |
| `400`  | Datos de entrada inválidos (email mal formado, contraseña muy corta) |
| `401`  | Contraseña incorrecta                                                |
| `404`  | El email no existe en el sistema                                     |

#### `POST /auth/logout`

No requiere body. El logout es del lado del cliente (el token JWT es stateless).

**Respuestas:**

| Código | Descripción                                                                          |
| ------ | ------------------------------------------------------------------------------------ |
| `200`  | `{ "message": "Logged out successfully. Please discard your token on the client." }` |
| `401`  | Token inválido o no proporcionado                                                    |

---

### 7.2 Users

| Método   | Ruta        | Auth                  | Descripción                      |
| -------- | ----------- | --------------------- | -------------------------------- |
| `POST`   | `/user`     | Pública               | Registrar un nuevo usuario       |
| `GET`    | `/user`     | Requiere auth         | Obtener todos los usuarios       |
| `GET`    | `/user/:id` | Requiere auth         | Obtener un usuario por ID        |
| `PATCH`  | `/user/:id` | Requiere auth         | Actualizar datos de un usuario   |
| `DELETE` | `/user/:id` | Requiere auth + Admin | Eliminar un usuario (solo Admin) |

#### `POST /user`

**Body:**

```json
{
    "email": "newuser@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "major1": "Software Engineering",
    "major2": "Mathematics",
    "xp": 0,
    "level": 1
}
```

> `major1` y `major2` deben ser uno de: `Software Engineering`, `Biology`, `Chemistry`, `Physics`, `Mathematics`.

**Respuestas:**

| Código | Descripción                                                               |
| ------ | ------------------------------------------------------------------------- |
| `201`  | Usuario creado. Retorna el objeto `User` con su `id` generado             |
| `400`  | Validación fallida (email inválido, major no permitido, campos faltantes) |
| `409`  | El email ya está registrado                                               |

#### `GET /user`

**Respuesta `200`:** Array de todos los usuarios.

#### `GET /user/:id`

**Parámetro:** `id` — ID numérico del usuario.

**Respuestas:**

| Código | Descripción           |
| ------ | --------------------- |
| `200`  | Objeto `User`         |
| `404`  | Usuario no encontrado |

#### `PATCH /user/:id`

**Body (todos los campos son opcionales):**

```json
{
    "firstName": "Jane",
    "xp": 100,
    "level": 5,
    "password": "NewPassword123"
}
```

**Respuestas:**

| Código | Descripción                   |
| ------ | ----------------------------- |
| `200`  | Usuario actualizado           |
| `404`  | Usuario no encontrado         |
| `409`  | El nuevo email ya está en uso |

#### `DELETE /user/:id`

**Respuestas:**

| Código | Descripción                                            |
| ------ | ------------------------------------------------------ |
| `200`  | `{ "message": "User with ID X removed successfully" }` |
| `401`  | No autenticado                                         |
| `403`  | No tiene rol Admin                                     |
| `404`  | Usuario no encontrado                                  |

---

### 7.3 Roles

> Todos los endpoints requieren Requiere auth y Admin (Admin).

| Método   | Ruta        | Descripción             |
| -------- | ----------- | ----------------------- |
| `POST`   | `/role`     | Crear un nuevo rol      |
| `GET`    | `/role`     | Obtener todos los roles |
| `GET`    | `/role/:id` | Obtener un rol por ID   |
| `PATCH`  | `/role/:id` | Actualizar un rol       |
| `DELETE` | `/role/:id` | Eliminar un rol         |

#### `POST /role`

**Body:**

```json
{
    "name": "TA",
    "description": "Teaching assistant role"
}
```

> `name` debe ser uno de: `Admin`, `Student`, `TA`, `Professor`.

**Respuestas:**

| Código | Descripción                                   |
| ------ | --------------------------------------------- |
| `201`  | Rol creado                                    |
| `400`  | Nombre de rol inválido (no pertenece al enum) |
| `401`  | No autenticado                                |
| `403`  | No tiene rol Admin                            |
| `409`  | El rol ya existe                              |

#### `GET /role`

**Respuesta `200`:** Array de roles con sus permisos y usuarios asignados (relaciones cargadas).

#### `PATCH /role/:id`

**Body:**

```json
{
    "description": "Updated description"
}
```

#### `DELETE /role/:id`

**Respuesta `200`:** `{ "message": "Role with ID X has been removed" }`

---

### 7.4 Permissions

> Todos los endpoints requieren Requiere auth y Admin (Admin).

| Método   | Ruta              | Descripción                |
| -------- | ----------------- | -------------------------- |
| `POST`   | `/permission`     | Crear un nuevo permiso     |
| `GET`    | `/permission`     | Obtener todos los permisos |
| `GET`    | `/permission/:id` | Obtener un permiso por ID  |
| `PATCH`  | `/permission/:id` | Actualizar un permiso      |
| `DELETE` | `/permission/:id` | Eliminar un permiso        |

#### `POST /permission`

**Body:**

```json
{
    "name": "Update",
    "description": "Can update resources"
}
```

> `name` debe ser uno de: `Create`, `Read`, `Update`, `Delete`.

**Respuestas:**

| Código | Descripción                |
| ------ | -------------------------- |
| `201`  | Permiso creado             |
| `400`  | Nombre de permiso inválido |
| `401`  | No autenticado             |
| `403`  | No tiene rol Admin         |
| `409`  | El permiso ya existe       |

---

### 7.5 User Roles

> Todos los endpoints requieren Requiere auth y Admin (Admin).

| Método   | Ruta             | Descripción                    |
| -------- | ---------------- | ------------------------------ |
| `POST`   | `/user-role`     | Asignar un rol a un usuario    |
| `GET`    | `/user-role`     | Obtener todas las asignaciones |
| `GET`    | `/user-role/:id` | Obtener una asignación por ID  |
| `DELETE` | `/user-role/:id` | Revocar un rol de un usuario   |

#### `POST /user-role`

**Body:**

```json
{
    "userId": 5,
    "roleId": 2
}
```

**Respuestas:**

| Código | Descripción                          |
| ------ | ------------------------------------ |
| `201`  | Rol asignado exitosamente            |
| `401`  | No autenticado                       |
| `403`  | No tiene rol Admin                   |
| `404`  | Usuario o Rol no encontrado          |
| `409`  | El usuario ya tiene ese rol asignado |

#### `DELETE /user-role/:id`

**Respuesta `200`:** `{ "message": "User role with id X deleted successfully" }`

---

### 7.6 Role Permissions

> Todos los endpoints requieren Requiere auth y Admin (Admin).

| Método   | Ruta                   | Descripción                    |
| -------- | ---------------------- | ------------------------------ |
| `POST`   | `/role-permission`     | Asignar un permiso a un rol    |
| `GET`    | `/role-permission`     | Obtener todas las asignaciones |
| `GET`    | `/role-permission/:id` | Obtener una asignación por ID  |
| `DELETE` | `/role-permission/:id` | Revocar un permiso de un rol   |

#### `POST /role-permission`

**Body:**

```json
{
    "roleId": 2,
    "permissionId": 1
}
```

**Respuestas:**

| Código | Descripción                          |
| ------ | ------------------------------------ |
| `201`  | Permiso asignado exitosamente        |
| `404`  | Rol o Permiso no encontrado          |
| `409`  | El rol ya tiene ese permiso asignado |

---

### 7.7 Courses

| Método   | Ruta           | Auth          | Descripción              |
| -------- | -------------- | ------------- | ------------------------ |
| `POST`   | `/courses`     | Requiere auth | Crear un curso           |
| `GET`    | `/courses`     | Requiere auth | Obtener todos los cursos |
| `GET`    | `/courses/:id` | Requiere auth | Obtener un curso por ID  |
| `PATCH`  | `/courses/:id` | Requiere auth | Actualizar un curso      |
| `DELETE` | `/courses/:id` | Requiere auth | Eliminar un curso        |

#### `POST /courses`

**Body:**

```json
{
    "name": "Data Science",
    "credits": 4,
    "duration": 16,
    "startDate": "2026-08-01T00:00:00.000Z"
}
```

**Respuestas:**

| Código | Descripción     |
| ------ | --------------- |
| `201`  | Curso creado    |
| `400`  | Datos inválidos |
| `401`  | No autenticado  |

---

### 7.8 User Courses

| Método   | Ruta               | Auth          | Descripción                       |
| -------- | ------------------ | ------------- | --------------------------------- |
| `POST`   | `/user-course`     | Requiere auth | Matricular un usuario en un curso |
| `GET`    | `/user-course`     | Requiere auth | Obtener todas las matrículas      |
| `GET`    | `/user-course/:id` | Requiere auth | Obtener una matrícula por ID      |
| `PATCH`  | `/user-course/:id` | Requiere auth | Actualizar el tipo de relación    |
| `DELETE` | `/user-course/:id` | Requiere auth | Eliminar una matrícula            |

#### `POST /user-course`

**Body:**

```json
{
    "userId": 1,
    "courseId": 2,
    "relationType": "student"
}
```

> `relationType` debe ser uno de: `student`, `professor`, `ta`.

**Respuestas:**

| Código | Descripción                     |
| ------ | ------------------------------- |
| `201`  | Matrícula creada                |
| `400`  | Tipo de relación inválido       |
| `404`  | Usuario o Curso no encontrado   |
| `409`  | El usuario ya está en ese curso |

---

### 7.9 Experience Badges

| Método   | Ruta                    | Auth          | Descripción                 |
| -------- | ----------------------- | ------------- | --------------------------- |
| `POST`   | `/experience-badge`     | Requiere auth | Crear una insignia          |
| `GET`    | `/experience-badge`     | Requiere auth | Obtener todas las insignias |
| `GET`    | `/experience-badge/:id` | Requiere auth | Obtener una insignia por ID |
| `PATCH`  | `/experience-badge/:id` | Requiere auth | Actualizar una insignia     |
| `DELETE` | `/experience-badge/:id` | Requiere auth | Eliminar una insignia       |

#### `POST /experience-badge`

**Body:**

```json
{
    "name": "Novice",
    "minLevel": 1,
    "message": "Welcome rookie",
    "associatePrices": "Sticker Pack"
}
```

---

### 7.10 User Badges

| Método   | Ruta              | Auth          | Descripción                       |
| -------- | ----------------- | ------------- | --------------------------------- |
| `POST`   | `/user-badge`     | Requiere auth | Asignar una insignia a un usuario |
| `GET`    | `/user-badge`     | Requiere auth | Obtener todas las asignaciones    |
| `GET`    | `/user-badge/:id` | Requiere auth | Obtener una asignación por ID     |
| `PATCH`  | `/user-badge/:id` | Requiere auth | Actualizar una asignación         |
| `DELETE` | `/user-badge/:id` | Requiere auth | Eliminar una asignación           |

#### `POST /user-badge`

**Body:**

```json
{
    "userId": 1,
    "experienceBadgeId": 1,
    "dateAcquired": "2026-04-26T00:00:00.000Z"
}
```

---

### 7.11 Posts

| Método   | Ruta        | Auth          | Descripción                      |
| -------- | ----------- | ------------- | -------------------------------- |
| `POST`   | `/post`     | Requiere auth | Crear una publicación en el foro |
| `GET`    | `/post`     | Requiere auth | Obtener todas las publicaciones  |
| `GET`    | `/post/:id` | Requiere auth | Obtener una publicación por ID   |
| `PATCH`  | `/post/:id` | Requiere auth | Actualizar una publicación       |
| `DELETE` | `/post/:id` | Requiere auth | Eliminar una publicación         |

#### `POST /post`

**Body:**

```json
{
    "userId": 1,
    "title": "Help with homework",
    "question": "How do I solve problem 1?"
}
```

---

### 7.12 Replies

> Toda la clase requiere Requiere auth + `RolesGuard`.

| Método   | Ruta                  | Auth                         | Descripción                  |
| -------- | --------------------- | ---------------------------- | ---------------------------- |
| `POST`   | `/reply`              | Requiere auth                | Crear una respuesta          |
| `GET`    | `/reply`              | Requiere auth                | Obtener todas las respuestas |
| `GET`    | `/reply/:id`          | Requiere auth                | Obtener una respuesta por ID |
| `PATCH`  | `/reply/:id`          | Requiere auth                | Actualizar una respuesta     |
| `DELETE` | `/reply/:id`          | Requiere auth                | Eliminar una respuesta       |
| `PATCH`  | `/reply/:id/like`     | Requiere auth                | Dar like a una respuesta     |
| `PATCH`  | `/reply/:id/validate` | Requiere auth + Professor/TA | Aprobar una respuesta        |

#### `POST /reply`

**Body:**

```json
{
    "postId": 1,
    "userId": 2,
    "replyMessage": "Try starting with the definitions",
    "replyId": null
}
```

> `replyId` puede ser el ID de otra reply para crear respuestas anidadas (hilo).

#### `PATCH /reply/:id/validate`

Solo accesible para usuarios con rol `Professor` o `TA`. Incrementa el contador de `approvals` de la respuesta.

---

### 7.13 Supplementary Sessions

| Método   | Ruta                          | Auth          | Descripción                |
| -------- | ----------------------------- | ------------- | -------------------------- |
| `POST`   | `/supplementary-sessions`     | Requiere auth | Crear una sesión de apoyo  |
| `GET`    | `/supplementary-sessions`     | Requiere auth | Obtener todas las sesiones |
| `GET`    | `/supplementary-sessions/:id` | Requiere auth | Obtener una sesión por ID  |
| `PATCH`  | `/supplementary-sessions/:id` | Requiere auth | Actualizar una sesión      |
| `DELETE` | `/supplementary-sessions/:id` | Requiere auth | Eliminar una sesión        |

#### `POST /supplementary-sessions`

**Body:**

```json
{
    "requestedDate": "2026-05-01T09:00:00.000Z",
    "completed": false,
    "topic": "Algebra review",
    "virtual": true
}
```

---

### 7.14 Attendance Supplementary Sessions

| Método   | Ruta                           | Auth          | Descripción                       |
| -------- | ------------------------------ | ------------- | --------------------------------- |
| `POST`   | `/attendance-supp-session`     | Requiere auth | Registrar asistencia a una sesión |
| `GET`    | `/attendance-supp-session`     | Requiere auth | Obtener todos los registros       |
| `GET`    | `/attendance-supp-session/:id` | Requiere auth | Obtener un registro por ID        |
| `PATCH`  | `/attendance-supp-session/:id` | Requiere auth | Actualizar un registro            |
| `DELETE` | `/attendance-supp-session/:id` | Requiere auth | Eliminar un registro              |

#### `POST /attendance-supp-session`

**Body:**

```json
{
    "suppSessionId": 1,
    "taId": 4,
    "studentId": 1,
    "attendanceNotes": "Attended on time",
    "additionalHomework": null
}
```

---

## 8. Pruebas

### 8.1 Pruebas Unitarias (Jest)

Se implementaron pruebas unitarias para los 5 módulos de los que se estuvo a cargo. Cada suite de pruebas usa **mocks del repositorio** de TypeORM para aislar la lógica del service sin necesidad de conexión a la base de datos real.

**Archivos de prueba:**

| Archivo                           | Módulo probado        | Casos                                                                                                                |
| --------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `auth.service.spec.ts`            | AuthService           | 7 casos: login exitoso, deduplicación de permisos, usuario sin roles, email no existe, contraseña incorrecta, logout |
| `user.service.spec.ts`            | UserService           | 10 casos: create, findAll, findOne, findByEmail, update, remove + errores                                            |
| `role.service.spec.ts`            | RoleService           | 8 casos: CRUD completo + duplicados + not found                                                                      |
| `permission.service.spec.ts`      | PermissionService     | 8 casos: CRUD completo + duplicados + not found                                                                      |
| `user-role.service.spec.ts`       | UserRoleService       | 8 casos: asignación, duplicado, FK no encontrada, revocación                                                         |
| `role-permission.service.spec.ts` | RolePermissionService | 8 casos: asignación, duplicado, FK no encontrada, revocación                                                         |

**Ejemplo de caso de prueba:**

```typescript
it('should throw ConflictException when email already exists', async () => {
    mockUserRepository.findOne.mockResolvedValue(mockUser); // email ocupado

    await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    expect(mockUserRepository.save).not.toHaveBeenCalled();
});
```

**Ejecutar pruebas unitarias:**

```bash
npm run test          # ejecutar todas las pruebas unitarias
npm run test:cov      # con reporte de cobertura de código
```

### 8.2 Pruebas de Integración E2E (Supertest)

Las pruebas E2E levantan la aplicación NestJS completa con su conexión real a PostgreSQL y verifican el comportamiento de la API de extremo a extremo mediante requests HTTP.

**Requisito:** La base de datos debe estar corriendo con el seed aplicado antes de ejecutar los tests E2E.

**Archivos de prueba E2E:**

| Archivo                   | Cobertura                                                     |
| ------------------------- | ------------------------------------------------------------- |
| `auth.e2e-spec.ts`        | Login exitoso/fallido, logout con/sin token                   |
| `users.e2e-spec.ts`       | CRUD completo de `/user`, validaciones, autenticación         |
| `roles.e2e-spec.ts`       | CRUD de `/role` y `/user-role`, control de acceso por rol     |
| `permissions.e2e-spec.ts` | CRUD de `/permission` y `/role-permission`, control de acceso |

**Lo que verifican las pruebas E2E:**

- Códigos HTTP correctos (200, 201, 400, 401, 403, 404, 409)
- Que las rutas públicas no requieren token
- Que las rutas protegidas retornan `401` sin token
- Que las rutas Admin retornan `403` para usuarios Student
- Que los datos retornados tienen la estructura esperada
- Que las operaciones de creación, actualización y eliminación persisten en la BD

**Ejemplo de prueba E2E:**

```typescript
it('should return 403 when Student tries to create a role', async () => {
    await request(app.getHttpServer())
        .post('/role')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ name: 'Professor' })
        .expect(403);
});
```

**Ejecutar pruebas E2E:**

```bash
npm run test:e2e
```

### 8.3 Pruebas Manuales con Postman

Se adjunta el archivo `scholar-sync.postman_collection.json` con **más de 60 requests** organizados por módulo, incluyendo casos de éxito y de error para cada endpoint.

**Cómo importar en Postman:**

1. Abrir Postman → Import
2. Seleccionar `scholar-sync.postman_collection.json`
3. La variable `baseUrl` está configurada en `http://localhost:3000`
4. Ejecutar primero `POST /auth/login` con `dave@example.com` / `Password123`
5. Copiar el `access_token` y configurarlo en la variable de entorno `token` de Postman

### 8.4 Documentación Interactiva con Swagger

La documentación de la API está disponible en `http://localhost:3000/api` cuando la aplicación está corriendo. Permite:

- Ver todos los endpoints agrupados por módulo
- Ver los esquemas de los DTOs con ejemplos
- Probar endpoints directamente desde el navegador
- Autenticarse con el botón **Authorize** usando el token JWT

---

_Computación en Internet III — Universidad ICESI · 2026_
