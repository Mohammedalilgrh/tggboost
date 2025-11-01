# Telegram Member Manager - Backend

This folder contains the Python backend server that performs the actual Telegram scraping and adding operations. The web frontend you see in the browser acts as a remote control for this server.

## How It Works

- It's a web server built with **Quart** (an asynchronous version of Flask).
- It uses **Telethon** to connect to your Telegram account and interact with the Telegram API.
- It exposes simple API endpoints (`/scrape`, `/add`, `/stop`) that the frontend calls.
- It requires your Telegram API credentials, which you must provide securely.

## Setup and Running

Follow these steps to get your backend running (e.g., on a service like Render or locally).

### 1. Install Dependencies

You need Python 3.8+ installed. Navigate to this `backend` directory in your terminal and run:

```bash
pip install -r requirements.txt
```

### 2. Create `.env` file

Create a file named `.env` in this `backend` directory. This file will store your secret credentials. **Do not share this file with anyone.**

Copy the following into your `.env` file and fill in your actual values:

```env
# Get these from my.telegram.org
TELEGRAM_API_ID="YOUR_API_ID"
TELEGRAM_API_HASH="YOUR_API_HASH"

# Your phone number with country code
TELEGRAM_PHONE_NUMBER="+1234567890"
```

### 3. First-Time Login

The first time you run the server, Telethon will need to authorize your account.

- It will create a `telegram_session.session` file to keep you logged in.
- It will ask you to enter the login code that Telegram sends to your app. **You must enter this code in the terminal where the server is running.**
- After the first successful login, you won't need to do this again unless you delete the `.session` file.

### 4. Run the Server

To run the server locally for testing, use this command in the `backend` directory:

```bash
python main.py
```

The server will start, and you should see log output in your terminal, including a line saying it's running on `http://0.0.0.0:5000`.

### 5. Connect the Frontend

- Once the server is running, go back to the web application.
- In the "Configuration" panel, make sure the "Backend URL" is set to `http://localhost:5000` (if running locally) or your public Render URL (if deployed).
- Click "Connect to Backend".
- If successful, the status will change to "Connected", and you can start using the controls to perform real actions!
