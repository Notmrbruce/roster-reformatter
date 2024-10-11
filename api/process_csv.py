from http.server import BaseHTTPRequestHandler
import json
import csv
import io
import base64
import pandas as pd
from scripts import csv_reformat_full, csv_reformat_offonly, csv_reformat_work_only

def process_csv(csv_content, option):
    df = pd.read_csv(io.StringIO(csv_content))
    
    if option == 'daysOff':
        processed_df = csv_reformat_offonly.process(df)
    elif option == 'workDays':
        processed_df = csv_reformat_work_only.process(df)
    else:
        processed_df = csv_reformat_full.process(df)

    output = io.StringIO()
    processed_df.to_csv(output, index=False)
    return output.getvalue()

def handler(request):
    if request.get('method', '') == 'POST':
        try:
            body = json.loads(request.get('body', '{}'))
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