# 🎯 Pocket Control

App de control de gastos para universitarios colombianos.  
Backend en Spring Boot + PostgreSQL, frontend en HTML/CSS/JS vanilla.

---

## 🚀 Configuración en 5 pasos

### Paso 1 — Crear la base de datos en PostgreSQL

Abre una terminal o DBeaver y ejecuta:

```sql
CREATE DATABASE pocketcontrol;
```

> Si usas DBeaver: click derecho en "Databases" → "Create New Database" → nombre: `pocketcontrol`

### Paso 2 — Configurar `application.properties`

Edita el archivo `backend/src/main/resources/application.properties` si tu usuario/contraseña de PostgreSQL son diferentes:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pocketcontrol
spring.datasource.username=postgres
spring.datasource.password=postgres
```

> Las tablas se crean automáticamente al iniciar la app (via `schema.sql`).

### Paso 3 — Correr el backend con Maven

Desde la carpeta `backend/`:

```bash
cd backend
./mvnw spring-boot:run
```

O si tienes Maven instalado globalmente:

```bash
cd backend
mvn spring-boot:run
```

> El backend arranca en `http://localhost:8080`

### Paso 4 — Abrir el frontend

Simplemente abre `frontend/index.html` en tu navegador (doble click o arrastralo al browser).

> No necesita servidor de archivos. Funciona con `file://`.

### Paso 5 — Conectar DBeaver a la BD (opcional)

1. Nueva conexión → PostgreSQL
2. Host: `localhost`
3. Port: `5432`
4. Database: `pocketcontrol`
5. Username: `postgres`
6. Password: `postgres`
7. Test Connection → Finish

---

## 📁 Estructura del proyecto

```
pocket-control/
├── backend/
│   ├── pom.xml
│   ├── src/main/java/com/pocketcontrol/
│   │   ├── PocketControlApplication.java
│   │   ├── config/CorsConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── ExpenseController.java
│   │   │   ├── StatsController.java
│   │   │   └── InvestmentController.java
│   │   ├── model/
│   │   │   ├── User.java
│   │   │   ├── Expense.java
│   │   │   ├── Budget.java
│   │   │   └── Investment.java
│   │   ├── repository/
│   │   │   ├── UserRepository.java
│   │   │   ├── ExpenseRepository.java
│   │   │   ├── BudgetRepository.java
│   │   │   └── InvestmentRepository.java
│   │   ├── service/
│   │   │   ├── AuthService.java
│   │   │   ├── ExpenseService.java
│   │   │   └── ClassifierService.java
│   │   └── dto/
│   │       ├── AuthRequest.java
│   │       ├── AuthResponse.java
│   │       ├── ExpenseRequest.java
│   │       ├── ExpenseResponse.java
│   │       └── StatsResponse.java
│   └── src/main/resources/
│       ├── application.properties
│       └── schema.sql
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

## 🔗 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Verificar sesión |
| POST | `/api/expenses` | Registrar gasto (texto libre) |
| GET | `/api/expenses?category=X` | Listar gastos del mes |
| DELETE | `/api/expenses/{id}` | Eliminar gasto |
| GET | `/api/stats` | Estadísticas del mes |
| GET | `/api/stats/home` | Datos para Home |
| GET | `/api/investments` | Listar inversiones |
| POST | `/api/investments` | Crear inversión |
| DELETE | `/api/investments/{id}` | Eliminar inversión |

## 🎨 Paleta de colores

| Uso | Color |
|-----|-------|
| Background | `#0C0C1A` |
| Surface | `#161630` |
| Border | `#252545` |
| Accent | `#6C63FF` |
| Text Primary | `#EEEEFF` |
| Text Secondary | `#888888` |
| Expense | `#C07878` |
| Positive | `#34C98A` |
