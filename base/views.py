from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
from dotenv import load_dotenv
import time
import os
load_dotenv()

def getToken(request):
    appId = os.getenv('APP_ID')
    channelName = request.GET.get('channel')
    appCertificate = os.getenv('APP_CERTIFICATE')
    uid=random.randint(1,230)
    expirationTimeInSeconds = 3600 *24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1 #host
    token = RtcTokenBuilder.buildTokenWithUid(appId,appCertificate,channelName,uid,role,privilegeExpiredTs)
    return JsonResponse({'token':token, 'uid':uid},safe=False)


def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    print(os.getenv('APP_ID'))
    return render(request, 'base/room.html',
    context={'APP_ID': os.environ.get('APP_ID')})