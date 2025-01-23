from datetime import datetime
from django.shortcuts import render

# Create your views here.
from django.http import HttpResponse

# Importe el decorador login_required
from django.contrib.auth.decorators import login_required

# Importe el decorador login_required
from django.contrib.auth.decorators import login_required, permission_required

# Importe requests y json
import requests
import json

# Restricción de acceso con @login_required y permisos con @permission_required
@login_required
@permission_required('main.index_viewer', raise_exception=True)
def index(request):
    # Arme el endpoint del REST API
    current_url = request.build_absolute_uri()
    url = current_url + '/api/v1/landing'

    # Petición al REST API
    response_http = requests.get(url)
    response_dict = json.loads(response_http.content)

    print("Endpoint ", url)
    print("Response ", response_dict)

    responses_list = list(response_dict.values())

    def clean_datetime_string(date_str):
        date_str = date_str.replace('\xa0', ' ')
        return date_str.strip()

    for response in responses_list:
        response['saved'] = clean_datetime_string(response['saved'])

    first_response = responses_list[0]['saved']
    print('primera respuesta', first_response)

    last_response = responses_list[-1]['saved']

    # Respuestas totales
    total_responses = len(response_dict.keys())

    # Valores de la respuesta
    responses = response_dict.values()

    from collections import defaultdict
    responses_by_day = defaultdict(list)
    for response in responses:
        day = response['saved'].split(",")[0]
        responses_by_day[day].append(response)

    max_day = max(responses_by_day, key=lambda day: len(responses_by_day[day]))
    max_responses = len(responses_by_day[max_day])

    # Objeto con los datos a renderizar
    data = {
        'title': 'Landing - Dashboard',
        'total_responses': total_responses,
        'first_response': first_response,
        'max_day': max_day,
        'max_responses': max_responses,
        'last_response': last_response,
        'responses': responses
    }

    # return HttpResponse("Hello, World!")
    # return render(request, 'main/base.html')

    # Renderización en la plantilla
    return render(request, 'main/index.html', data)