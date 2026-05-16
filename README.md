# Handwritten Digit Recognition App

A full-stack application that recognises handwritten digits from an uploaded image using a trained CNN model, translates the result to Finnish, and converts it to speech using Azure Cognitive Services.

---

## How It Works

1. User uploads a handwritten digit image
2. React frontend sends the image to the Python Flask backend
3. A trained Keras CNN model predicts the digit
4. The result is translated from English to Finnish via Azure Translator
5. Azure Cognitive Speech converts the Finnish text to audio
6. Audio is returned and played in the browser

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Axios, FontAwesome |
| Backend | Python, Flask, Keras, TensorFlow |
| ML Model | CNN trained on MNIST (handwritten digits) |
| Translation | Azure Translator Cognitive Service |
| Text to Speech | Azure Cognitive Speech Service |
| Infrastructure | Docker, Docker Compose, Nginx (reverse proxy) |

---

## Architecture

Microservices architecture with three containers orchestrated via Docker Compose:

```
Browser
  |
Nginx (port 3050)
  |-- /          --> React frontend (port 3000)
  |-- /api       --> Flask backend  (port 5000)
```

---

## Project Structure

```
digit_identification/
├── frontend/           # React 18 app
│   ├── src/
│   └── Dockerfile.dev
├── backend/            # Python Flask API + Keras model
│   ├── main.py         # Flask routes
│   ├── model.py        # CNN model definition
│   ├── keras_model.py  # Model training script
│   ├── handwritten_digits.h5
│   └── Dockerfile.dev
├── nginx/              # Reverse proxy config
│   └── Dockerfile.dev
└── docker-compose.yml
```

---

## Snapshots

React app home page

![Home](https://github.com/spavythra/kube_digit_identification/assets/87486009/c6438cef-4c7b-489a-9136-b049ddc4b1d1)

Digit prediction result after upload

![Prediction](https://github.com/spavythra/kube_digit_identification/assets/87486009/42a898b2-1ce8-4a94-99ef-74df16cb2c9b)

Finnish translation of the predicted digit

![Translation](https://github.com/spavythra/kube_digit_identification/assets/87486009/7e6a69e4-56db-4537-9702-2018788d7bb8)

Azure Speech text to speech output

![Speech](https://github.com/spavythra/kube_digit_identification/assets/87486009/f06f4ff2-10e1-4b3e-8302-c6172b998fc0)

---

## Run Locally

### Prerequisites

- Docker and Docker Compose
- Azure Translator and Speech API keys

### Setup

1. Clone the repository

```bash
git clone https://github.com/spavythra/kube_digit_identification.git
cd kube_digit_identification
```

2. Add your Azure credentials to the backend environment

3. Start all services

```bash
docker-compose up --build
```

App runs at `http://localhost:3050`
