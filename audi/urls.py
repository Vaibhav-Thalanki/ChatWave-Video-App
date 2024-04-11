from django.urls import path
from .views import index , transcribe_audio, respondLLM, respondLLMGPT

urlpatterns = [
    path('llm_response/',respondLLM , name='respondLLM'),
]