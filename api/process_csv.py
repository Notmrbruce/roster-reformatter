from http.server import BaseHTTPRequestHandler
import json
import csv
import io
import base64
from scripts import csv_reformat_full, csv_reformat_offonly, csv_reformat_work_only

def process_csv(csv_content, option):
    csv_file = io.StringIO(csv_content)
    reader = csv.reader(csv_file)
    rows = list(reader)

    if option == 'daysOff':
        processed_rows = csv_reformat_offonly.process(rows)
    elif option == 'workDays':
        processed_rows = csv_reformat_work_only.process(rows)
    else:
        processed_rows = csv_reformat_full.process(rows)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerows(processed_rows)
    return output.getvalue()

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))

        csv_content = base64.b64decode(data['file']).decode('utf-8')
        option = data['option']

        processed_csv = process_csv(csv_content, option)

        self.send_response(200)
        self.send_header('Content-type', 'text/csv')
        self.end_headers()
        self.wfile.write(processed_csv.encode('utf-8'))
