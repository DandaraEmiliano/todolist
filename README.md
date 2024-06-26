# Task Management API

This project is a REST API for task management built with Spring Boot. It provides endpoints for user authentication and CRUD operations for tasks.

## Requirements

- Java 17
- Maven
- JPA / Hibernate
- Docker (optional, for containerization)

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/dandaraemiliano/todolist.git
    cd todolist
    ```

2. Build the project using Maven:
    ```bash
    mvn clean install
    ```

3. Alternatively, you can build and run the project using Docker:
    ```bash
    docker build -t todolist .
    docker run -p 8080:8080 todolist
    ```

## Running the Application

1. To run the application locally, use the following Maven command:
    ```bash
    mvn spring-boot:run
    ```

2. Access the application at `http://localhost:8080`.

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

