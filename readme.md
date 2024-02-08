# Blog App Backend

This repository contains the backend code for a Blog application, providing a robust server-side implementation to support functionalities.

## Overview

This API empowers users with essential features, including user registration, login, and profile management. It facilitates seamless blog post operations, allowing users to create, read, update, and delete posts. Furthermore, users can actively engage in discussions by adding, viewing, and deleting comments on blog posts

## Features

-   **User Management**:

    -   User Registration
    -   User Login
    -   Profile Management (CRUD operations)

-   **Blog Posts**:

    -   Create, Read, Update, Delete (CRUD) operations on blog posts

-   **Comments**:
    -   Add, View, Delete comments on blog posts

## Tech Stack

-   **Node.js & Express**: Utilized as the backend server environment and web application framework for building RESTful APIs.

-   **MongoDB**: NoSQL database to store user data and playlist information.

-   **JWT (JSON Web Tokens)**: Used for user authentication and authorization.

-   **TypeScript**: Chosen for its statically-typed nature, aiding in code maintainability and reducing potential runtime errors.

-   **Cloudinary**: Integrated for efficient and scalable cloud-based media management, providing a reliable solution for handling images and other media assets.

-   **Winston**: Employed as a logging library to enhance error tracking and debugging capabilities, contributing to the overall robustness of the application.

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/amit-kandar/blog-backend.git
    ```

2. Navigate to the project directory:
    ```bash
    cd blog-backend
    ```
3. Install dependencies:

    ```bash
    npm install
    ```

    Or if you prefer Yarn:

    ```bash
    yarn add
    ```

4. Start the development server:
    ```bash
    npm start
    ```
    Or with Yarn:
    ```bash
    yarn start
    ```
5. Open your web browser and visit http://localhost:8080.

## Configuration

To run this application, you need to set up the following environment variables. Create a `.env` file in the root of your project and add the necessary values.

-   **Server Configuration**:

    -   **PORT**: Specifies the port on which the server will run (set to 8080 in this case).

-   **Database Configuration**:

    -   **MONGO_URI**: MongoDB connection string, pointing to your database hosted on MongoDB Atlas.

-   **CORS Configuration**:

    -   **CORS_ORIGIN**: Defines the allowed CORS (Cross-Origin Resource Sharing) origin URL, set to `http://localhost:3000`.

-   **Caching Configuration**:

    -   **REDIS_URL**: Redis URL for caching, set to `redis://localhost:6379`.

-   **Token Configuration**:

    -   **ACCESS_TOKEN_SECRET**: Secret key for generating access tokens.
    -   **ACCESS_TOKEN_EXPIRY**: Expiry duration for access tokens, set to 1 day (`1d`).
    -   **REFRESH_TOKEN_SECRET**: Secret key for generating refresh tokens.
    -   **REFRESH_TOKEN_EXPIRY**: Expiry duration for refresh tokens, set to 10 days (`10d`).

-   **Cloudinary Configuration**:
    -   **CLOUDINARY_CLOUD_NAME**: Cloudinary cloud name for media storage.
    -   **CLOUDINARY_API_KEY**: API key for Cloudinary integration.
    -   **CLOUDINARY_API_SECRET**: API secret for Cloudinary integration.

## Contact

If you have any questions or need assistance, please feel free to contact me at kandaramit2001@gmail.com.

##### Happy coding!
