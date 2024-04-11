# ChatWave Video Chat

ChatWave is a video chat application that allows users to join video calls with up to 10 people. It features personalized rooms where users can share a code to invite others to join. Additionally, each participant has a personal voice assistant in their video chat, powered by Llama LLM.

## Project Information

- **Tech Stack:**
  - Frontend: JavaScript
  - Backend: Python Django
  - WebRTC: Agora SDK
  - Personal Voice Assistant: Llama LLM

## Installation

To run the application locally, follow these steps:

1. Clone the repository: `git clone https://github.com/Vaibhav-Thalanki/ChatWave-Video-App.git`
2. Install the required dependencies: `pip install -r requirements.txt`
3. Set up environment variables:
   - Create a `.env` file in the root of the project.
   - Add your Replicate API Token, Agora App Certificate and Agora App ID to the `.env` file:
     ```
     APP_CERTIFICATE=your_agora_app_certificate
     APP_ID=your_agora_app_id
     REPLICATE_API_TOKEN=your_replicate_api_token
     ```
4. Start the development server: `python manage.py runserver`

## Usage

1. Open the application in your web browser (localhost:8000).
2. Create a new room or join an existing room by entering the room code.
3. Share the room code with others to invite them to join your video call.
4. Enjoy your video call with personal voice assistants!

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your changes.

