# Chrono – Watch Store

Chrono is a full-stack e-commerce application for browsing and purchasing watches. I built this project to practise working with React and Django together, implementing authentication, managing shopping carts, handling orders, and deploying a full-stack application.

The frontend is built with React, while Django REST Framework handles the backend APIs. PostgreSQL is used for storing application data.

## Live Demo

**Live Website:** [https://chrono-0j2c.onrender.com](https://chrono-0j2c.onrender.com)

**Demo Account:**

- Email: `demo@gmail.com`
- Password: `Chrono1234`

The live application runs in demo mode. Email-based features are disabled in the deployed version.

## Features

### User Authentication

- User registration and login.
- JWT-based authentication using access and refresh tokens.
- Refresh token stored in an HttpOnly cookie.
- Automatic access-token refresh.
- CSRF protection for authentication requests.
- Logout functionality.

### Product Catalogue

- Browse available watches.
- View individual product details.
- Display watch specifications.
- Retrieve product information through REST APIs.

### Shopping Cart

- Add products to the cart.
- Update product quantities.
- Remove products from the cart.
- Cart functionality for authenticated users.

### Orders

- Place orders through the checkout process.
- Validate product stock before creating an order.
- Store product details and prices in order items.
- Use database transactions to maintain order consistency.

### Background Tasks

- Celery and Redis are configured for background processing.
- Email-related tasks include account verification, password reset, and order confirmation.
- Email tasks are disabled in the live demo deployment.

## Tech Stack

| Area             | Technology            |
| ---------------- | --------------------- |
| Frontend         | React 19              |
| Build Tool       | Vite                  |
| Styling          | Tailwind CSS v4       |
| Backend          | Django 5.2            |
| API              | Django REST Framework |
| Authentication   | Simple JWT            |
| Database         | PostgreSQL            |
| Background Tasks | Celery                |
| Message Broker   | Redis                 |
| Media Storage    | Cloudinary            |
| Web Server       | Gunicorn              |
| Static Files     | WhiteNoise            |
| Containerization | Docker                |
| Deployment       | Render                |
| Database Hosting | Neon                  |

## Project Structure

The project is organized into separate frontend and backend directories.

```text
chrono/
│
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── views.py
│   │   └── wsgi.py
│   │
│   ├── apps/
│   │   ├── catalog/
│   │   ├── cart/
│   │   └── orders/
│   │
│   ├── accounts/
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── docker/
│
├── .dockerignore
├── .env.example
├── compose.yaml
└── Dockerfile.combined
```

### Backend

The Django backend is divided into separate apps based on functionality.

- `accounts` – User authentication and account-related functionality.
- `catalog` – Product catalogue and watch information.
- `cart` – Shopping cart management.
- `orders` – Checkout and order management.
- `config` – Django project settings, URL configuration, and application setup.

### Frontend

The React frontend handles the user interface and communicates with the Django REST APIs.

The application uses React Context for shared application state, including authentication and shopping cart information.

## Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/shibith-dev/django-react-ecommerce.git

cd django-react-ecommerce
```

### 2. Configure Environment Variables

Create a `.env` file in the project root.

Use `.env.example` as a reference.

```bash
cp .env.example .env
```

Update the values according to your local environment.

The main configuration variables include:

```env
DJANGO_SECRET_KEY=your-local-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=your-database-url

CLOUDINARY_URL=your-cloudinary-url

DEMO_MODE=False
ENABLE_EMAIL_TASKS=False

ORDER_SHIPPING_COST=0.00
```

Make sure you use your own database credentials, Cloudinary credentials, and Django secret key.

### 3. Start the Application Using Docker

Docker Compose is used to run the application's services together.

Make sure Docker Desktop or Docker Engine is running.

Build and start the services:

```bash
docker compose up --build
```

The Compose configuration includes:

- Django backend
- React frontend
- PostgreSQL
- Redis
- Celery
- Combined application service

The combined service is used for testing the production-style setup locally.

### 4. Run Database Migrations

For the regular backend service, run:

```bash
docker compose exec backend python manage.py migrate
```

If you are running only the combined service, use:

```bash
docker compose exec combined python manage.py migrate
```

The combined production image also runs migrations during container startup.

### 5. Access the Application

With the combined service running, open:

**Website:** [http://localhost:8001/](http://localhost:8001/)

**Django Admin:** [http://localhost:8001/admin/](http://localhost:8001/admin/)

**Products API:** [http://localhost:8001/api/v1/products/](http://localhost:8001/api/v1/products/)

The separate frontend and backend services in the development Compose configuration can also be accessed using their configured ports.

## Running Without Docker

The project can also be run manually if you prefer to work directly with Python and Node.js.

### Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

On Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

### Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend and backend should be running separately during this development setup.

Make sure the frontend development API configuration points to the local Django server.

## Deployment

The production application is deployed on Render using a combined Docker image.

Initially, the frontend and backend were deployed as separate services. This caused authentication issues in Safari because the frontend and backend were on different origins, and browser privacy settings affected cross-site authentication cookies.

To address this, I changed the deployment architecture.

### Combined Deployment Architecture

The React production build is generated inside the Django project. Django serves the frontend application and its static assets, while also handling API requests.

```text
                 Browser
                    |
                    |
             Chrono Website
           chrono-0j2c.onrender.com
                    |
              Django / Gunicorn
                    |
          ┌─────────┴──────────┐
          |                   |
     React Frontend        REST APIs
       Static Build         /api/v1/
                                |
                                |
                          PostgreSQL
```

The combined Docker image uses a multi-stage build:

1. Node.js builds the React application.
2. Python installs Django dependencies.
3. The React build is copied into the Django application.
4. Django collects static files.
5. Gunicorn starts the Django application.

This allows the frontend and backend to run under the same origin.

### Production Configuration

The production deployment uses environment variables configured in Render.

Important variables include:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS`
- `DATABASE_URL`
- `CLOUDINARY_URL`
- `DEMO_MODE=True`
- `ENABLE_EMAIL_TASKS=False`

The production frontend uses relative API paths such as `/api/v1/`, so it does not need a separate backend hostname.

## Database and Media Storage

PostgreSQL is used to store application data, including users, products, carts, and orders.

The production database is hosted on Neon.

Cloudinary is used for media storage, so product images do not depend on the lifetime of the application container.

## Some Things I Learned

Building Chrono helped me understand how different parts of a full-stack application work together.

Some of the main things I worked on were:

- Connecting a React frontend to a Django REST API.
- Implementing JWT authentication with HttpOnly refresh cookies.
- Understanding CSRF protection and browser cookie policies.
- Managing shared frontend state with React Context.
- Handling database transactions during checkout.
- Using Docker Compose to run multiple services locally.
- Creating a multi-stage Docker build.
- Configuring Django to serve a React production build.
- Debugging deployment issues through Render logs.
- Configuring environment variables for production.

One of the more interesting challenges was resolving the cross-origin authentication issue in Safari. Solving it required changing the deployment architecture rather than simply modifying frontend API requests.

## Future Improvements

Some areas I would like to improve as I continue working on the project:

- Add automated backend and frontend tests.
- Improve product filtering and search.
- Add payment gateway integration.
- Improve order tracking.
- Add more detailed error handling and logging.
- Add CI/CD checks before deployment.

## Author

**Shibith**

GitHub: [https://github.com/shibith-dev](https://github.com/shibith-dev)

---

This project was built as a hands-on full-stack development project to learn and practise React, Django, REST APIs, authentication, database management, Docker, and deployment.