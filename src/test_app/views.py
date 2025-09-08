from rest_framework.response import Response


@action(detail=False, methods=['get'], url_path='')
def home(request):
    print("We are on server!!")
    return Response("Hello, World!")