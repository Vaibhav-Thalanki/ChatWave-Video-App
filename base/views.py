from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
from dotenv import load_dotenv
import time
import os
import json
from .models import RoomMember
from django.views.decorators.csrf import csrf_exempt
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

@csrf_exempt
def createMember(request):
    data = json.loads(request.body)
    member, created = RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name = data['room_name']
    )
    return JsonResponse({'name':data['name']},safe=False)

def getMember(request):
    uid = request.GET.get('UID')
    room_name = request.GET.get('room_name')
    member = RoomMember.objects.get(uid=uid,room_name=room_name)
    name = member.name
    return JsonResponse({'name':name},safe=False)

@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)
    print(data)
    response = 'Member already deleted'
    try:
        member = RoomMember.objects.get(uid=data['UID'],room_name=data['room_name'])
        member.delete()
        response = 'Member' + data['name'] +' was deleted'
    except:
        None
    finally:
        return JsonResponse({'response':response},safe=False)