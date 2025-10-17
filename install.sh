#!/bin/bash
# install.sh: One-step script to install all dependencies for the Nav-Website project.

echo "--- Starting Nav-Website Installation ---"

# 1. Install Backend Dependencies
echo "1. Installing backend dependencies..."
npm install

# 2. Check and Create Database Directory
echo "2. Ensuring database directory exists..."
mkdir -p database

# 3. Create initial .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "3. Creating initial .env file..."
  echo "PORT=3000" > .env
  echo "JWT_SECRET=a_secure_random_key_for_auth" >> .env
  echo "DB_PATH=./database/nav.db" >> .env
else
  echo "3. .env file already exists. Skipping creation."
fi

# 4. Install Frontend Dependencies
echo "4. Installing frontend (web) dependencies..."
cd web
npm install

# 5. Build Frontend (for initial static serving by the backend)
echo "5. Building the frontend application..."
npm run build

echo "--- Installation Complete! ---"
echo " "
echo "To start the application:"
echo "1. Navigate back to the root directory: cd .."
echo "2. Run the Express server: npm run dev"
echo " "
echo "Access the application at http://localhost:3000"
