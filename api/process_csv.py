from http.server import BaseHTTPRequestHandler
import json
import base64
import traceback
from scripts.script_wrapper import wrapper

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8'))
            
            csv_content = base64.b64decode(body['file']).decode('utf-8')
            option = body['option']

            # Parse CSV content
            lines = csv_content.strip().split('\n')
            headers = lines[0].split(',')
            data = [line.split(',') for line in lines[1:]]

            # Process using the wrapper
            processed_csv = wrapper(headers, data, option)

            self.send_response(200)
            self.send_header('Content-type', 'text/csv')
            self.end_headers()
            self.wfile.write('\n'.join([','.join(row) for row in processed_csv]).encode())

        except Exception as e:
            error_details = traceback.format_exc()
            print(f"Error processing request: {str(e)}\n{error_details}")
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({
                'error': 'Internal Server Error',
                'details': str(e),
                'traceback': error_details
            }).encode())

    def do_GET(self):
        self.send_response(405)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'error': 'Method Not Allowed'}).encode())