# Environment Setup

Create a `.env` file in the `backend` directory with the following content:

```
MONGO_URL=mongodb://localhost:27017/exams
JWT_SECRET=change_me_to_a_random_secret_key_for_production
PORT=3000
```

## Instructions

1. Copy this content to a new file named `.env` in the `backend` folder
2. Update `JWT_SECRET` with a strong random string for production use
3. Update `MONGO_URL` if your MongoDB is running on a different host/port
4. Make sure MongoDB is running before starting the server




