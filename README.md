# Task Management API

This Spring Boot REST API lets users register and create, list, and update their own tasks. Task endpoints use HTTP Basic authentication.

## Requirements

- JDK 17
- Docker (optional, for containerization)

## Running the Application

Clone the repository and start the API with the included Maven Wrapper:

```bash
git clone https://github.com/DandaraEmiliano/todolist.git
cd todolist
./mvnw spring-boot:run
```

On Windows, run `mvnw.cmd spring-boot:run` from the repository directory. The API listens on `http://localhost:8080`. It uses an in-memory H2 database, so users and tasks are reset when the app stops.

In a second terminal, register a demo user and list their tasks:

```bash
curl --fail --silent --show-error --output /dev/null \
  --header 'Content-Type: application/json' \
  --data '{"username":"demo","name":"Demo User","password":"demo-password"}' \
  http://localhost:8080/users/

curl --user demo:demo-password http://localhost:8080/tasks/
```

The second request returns `[]` for a newly registered user.

To run the app with Docker:

```bash
docker build -t todolist .
docker run --rm -p 8080:8080 todolist
```

To run the tests, use `./mvnw test` (`mvnw.cmd test` on Windows).

## API Endpoints

### User Endpoints

- **Create User**
    - **URL:** `/users/`
    - **Method:** `POST`
    - **Request Body:**
        ```json
        {
            "username": "string",
            "name": "string",
            "password": "string"
        }
        ```
    - **Response:**
        - `200 OK`: User created successfully
        - `400 Bad Request`: User already exists

### Task Endpoints

- **Create Task**
    - **URL:** `/tasks/`
    - **Method:** `POST`
    - **Request Body:**
        ```json
        {
            "title": "string",
            "description": "string",
            "startAt": "date-time",
            "endAt": "date-time",
            "priority": "string"
        }
        ```
    - **Response:**
        - `200 OK`: Task created successfully
        - `400 Bad Request`: Validation errors

- **List Tasks**
    - **URL:** `/tasks/`
    - **Method:** `GET`
    - **Response:**
        - `200 OK`: Returns a list of tasks for the authenticated user

- **Update Task**
    - **URL:** `/tasks/{id}`
    - **Method:** `PUT`
    - **Request Body:**
        ```json
        {
            "title": "string",
            "description": "string",
            "startAt": "date-time",
            "endAt": "date-time",
            "priority": "string"
        }
        ```
    - **Response:**
        - `200 OK`: Task updated successfully
        - `400 Bad Request`: Task not found or user not authorized

