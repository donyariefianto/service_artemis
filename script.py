print("python running")
try:
    import requests 
    import urllib3
    urllib3.disable_warnings(category=urllib3.exceptions.InsecureRequestWarning)
    # URL to which the POST request will be sent
    url = 'https://192.168.2.102/artemis-web/debug'

    # Data to be sent in the body of the POST request
    data = {
        'key1': 'value1',
        'key2': 'value2',
    }

    # Optional headers (e.g., Content-Type, Authorization)
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your_token_here'
    }

    # Send the POST request
    response = requests.post(url, json=data, headers=headers)

    # Check the response
    if response.status_code == 200:
        print('Success!')
        print('Response:', response.json())  # If the response is JSON
    else:
        print('Failed!')
        print('Status Code:', response.status_code)
        print('Response Text:', response.text)
except (e):
    print(e)

