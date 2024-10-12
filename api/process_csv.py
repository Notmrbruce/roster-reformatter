import json
import csv
import io
import base64
from scripts import csv_reformat_full, csv_reformat_offonly, csv_reformat_work_only

def process_csv(csv_content, option):
    reader = csv.reader(io.StringIO(csv_content))
    rows = list(reader)
    headers = rows[0]
    data = rows[1:]
    
    if option == 'daysOff':
        processed_rows = csv_reformat_offonly.process(headers, data)
    elif option == 'workDays':
        processed_rows = csv_reformat_work_only.process(headers, data)
    else:
        processed_rows = csv_reformat_full.process(headers, data)

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerows(processed_rows)
    return output.getvalue()

def handler(event, context):
    if event['httpMethod'] == 'POST':
        try:
            body = json.loads(event['body'])
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
                'headers': {
                    'Content-Type': 'application/json',
                },
                'body': json.dumps({'error': str(e)}),
            }
    else:
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
            },
            'body': json.dumps({'error': 'Method Not Allowed'}),
        }