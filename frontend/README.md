# Roller Frontend

This project was bootstrapped with Vite and uses React.

## Environment Variables

The application expects an API base URL to be provided. Create a `.env` file at the project root containing:

```
VITE_API_BASE_URL=http://localhost:9500/api/v1
```

Adjust the value according to your backend location. Vite will expose this variable to the client code as `import.meta.env.VITE_API_BASE_URL`.