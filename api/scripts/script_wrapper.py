import csv
import io
from csv_reformat_full import process as process_full
from csv_reformat_offonly import process as process_offonly
from csv_reformat_work_only import process as process_workonly

def create_temp_csv(headers, data):
    temp_file = io.StringIO()
    writer = csv.writer(temp_file)
    writer.writerow(headers)
    writer.writerows(data)
    temp_file.seek(0)
    return temp_file

def wrapper(headers, data, option):
    temp_csv = create_temp_csv(headers, data)
    
    if option == 'full':
        result = process_full(temp_csv)
    elif option == 'daysOff':
        result = process_offonly(temp_csv)
    elif option == 'workDays':
        result = process_workonly(temp_csv)
    else:
        raise ValueError("Invalid option")
    
    return result