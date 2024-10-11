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

def handler(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            csv_content = base64.b64decode(body['file']).decode('utf-8')
            option = body['option']

            processed_csv = process_csv(csv_content, option)

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'text/csv',
                },
                'body': processed_csv,
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': str(e)}),
            }
    else:
        return {
            'statusCode': 405,
            'body': 'Method Not Allowed',
        }