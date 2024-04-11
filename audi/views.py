# whisper_asr_app/views.py
from django.shortcuts import render
from django.http import JsonResponse
import requests
import time
import os
import replicate
import json
from dotenv import load_dotenv
from django.views.decorators.csrf import csrf_exempt
load_dotenv()


def index(request):
    return render(request, 'index.html')


@csrf_exempt
def respondLLMGPT(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text = data.get('text')
        api_key = os.getenv('OPENAI_API')
        api_url = 'https://api.openai.com/v1/chat/completions'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        }
        data = {
            "model": "gpt-3.5-turbo",
            'messages': [
                {
        "role": "system",
        "content": "You are a helpful assistant."
      },{
          "role":"user",
          "content":text
      }
            ],
        }

        try:
            response = requests.post(
                api_url, headers=headers, json=data)
            response.raise_for_status()
            result = response.json()
            print(result['choices'][0]['message'])
            return JsonResponse({'response': result['choices'][0]['message']})
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': f'Error during transcription: {e}'})
    
    return JsonResponse({'error': 'Invalid request method'})



@csrf_exempt
def respondLLM(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        text = data.get('text')
        replicateApi = replicate.Client(api_token=os.getenv("REPLICATE_API_TOKEN"))
        
        output =replicateApi.run( "meta/llama-2-13b-chat", input={
          "debug": False,
          "top_p": 1,
          "prompt": text,
          "temperature": 0.75,
          "system_prompt": "You are a helpful assistant for a meeting. Do not greet or use any formalities, just give the answer.",
          "max_new_tokens": 300,
          "min_new_tokens": -1,
          "prompt_template": "[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\n{prompt} [/INST]",
          "repetition_penalty": 1},)
        output_variable = ""
        for item in output:
            output_variable += item

        return JsonResponse({'response': output_variable})
    
    return JsonResponse({'error': 'Invalid request method'})



def transcribe_audio(request):
    if request.method == 'POST':
        transcription = request.POST.get('transcription', '')

        # Replace 'YOUR_WHISPER_API_KEY' with your actual Whisper ASR API key
        api_key = os.getenv('OPENAI_API')
        api_url = 'https://api.openai.com/v1/audio/transcriptions'

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        }

        data = {
            'audio': [transcription],
        }

        try:
            response = requests.post(
                api_url, headers=headers, json=data, timeout=90)
            response.raise_for_status()
            result = response.json()

            return JsonResponse({'transcription': result[0].get('text', '')})
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': f'Error during transcription: {e}'})

    return JsonResponse({'error': 'Invalid request method'})
