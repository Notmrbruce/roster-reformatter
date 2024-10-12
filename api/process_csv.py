from http.server import BaseHTTPRequestHandler
import json
import base64
import traceback
from scripts.script_wrapper import wrapper

def handle_request(event, context):
    try:
        body = json.loads(event['body'])
        csv_content = base64.b64decode(body['file']).decode('utf-8')
        option = body['option']

        # Parse CSV content
        lines = csv_content.strip().split('\n')
        headers = lines[0].split(',')
        data = [line.split(',') for line in lines[1:]]

        # Process using the wrapper
        processed_csv = wrapper(headers, data, option)

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'text/csv'},
            'body': '\n'.join([','.join(row) for row in processed_csv])
        }

    except Exception as e:
        error_details = traceback.format_exc()
        print(f"Error processing request: {str(e)}\n{error_details}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Internal Server Error',
                'details': str(e),
                'traceback': error_details
            })
        }

def handler(event, context):
    if event['httpMethod'] == 'POST':
        return handle_request(event, context)
    else:
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method Not Allowed'})
        }