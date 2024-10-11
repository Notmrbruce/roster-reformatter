import csv
from datetime import datetime, time, timedelta
import re

def parse_time(time_str):
    try:
        return datetime.strptime(time_str, "%H:%M:%S").time()
    except ValueError:
        try:
            return datetime.strptime(time_str, "%H:%M").time()
        except ValueError:
            return None

def is_time(value):
    return parse_time(str(value)) is not None

def remove_non_numeric(s):
    return re.sub(r'[^0-9]', '', s)

def reformat_roster(file_path):
    print(f"Opening CSV file: {file_path}")
    
    with open(file_path, 'r', newline='') as csvfile:
        reader = csv.reader(csvfile)
        data = list(reader)

    data = data[5:]
    print("Step 1: Removed the first 5 lines (metadata)")

    for row in data:
        del row[5:20]
    print("Step 2: Deleted columns F through T")

    for row in data:
        row.insert(0, row.pop(3))
    print("Step 3: Moved column D to column A")

    # Replace existing headers instead of inserting new ones
    headers = ["SUBJECT", "START DATE", "START TIME", "END TIME", "DESCRIPTION"]
    data[0] = headers
    print("Step 4-8: Replaced header texts for columns A through E")

    for row in data[1:]:
        if not row[0]:
            row[0] = row[2]
    print("Step 9: Filled blank cells in column A with corresponding data from column C")

    for row in data[1:]:
        if row[0] == "STUD":
            row[2] = "09:00"
            row[3] = "17:00"
    print("Step 10: Handled STUD entries")

    for row in data[1:]:
        if not is_time(row[2]):
            row[2] = "00:00"
    print("Step 11: Filled non-time cells in column C with 00:00")

    for row in data[1:]:
        if not row[3]:
            row[3] = "23:59"
    print("Step 12: Filled blank cells in column D with 23:59")

    additional_text = "***RD = Rest Day, A/L = Annual Leave, Any days at the start or end of these days may also be impacted by shifts starting/ finishing during them, example may not finish work from previous work day until 02.00 but technically that day is still a RD or A/L***"
    for row in data[1:]:
        if not row[4]:
            row[4] = f"{row[0]} {additional_text}"
    print("Step 13: Filled blank cells in column E with data from column A and additional text")

    for row in data[1:]:
        if row[1]:
            date_str = remove_non_numeric(str(row[1])[6:])
            if len(date_str) == 8:
                try:
                    date_obj = datetime.strptime(date_str, "%d%m%Y")
                    row[1] = date_obj.strftime("%d/%m/%Y")
                except ValueError:
                    print(f"Warning: Invalid date in row {data.index(row) + 1}")
    print("Step 14: Modified dates in column B")

    for row in data:
        row.insert(3, "END DATE" if row == headers else "")
    print("Step 15: Added new 'END DATE' column between C and D")

    for row in data[1:]:
        try:
            start_date = datetime.strptime(row[1], "%d/%m/%Y")
            start_time = parse_time(row[2])
            end_time = parse_time(row[4])
            if start_date and start_time and end_time:
                end_date = start_date.date()
                if end_time < start_time:
                    end_date += timedelta(days=1)
                row[3] = end_date.strftime("%d/%m/%Y")
        except ValueError:
            print(f"Warning: Invalid date/time in row {data.index(row) + 1}")
    print("Step 16: Calculated END DATE for all rows")

    for i in range(2, len(data)):
        if data[i][0] in ["RD", "A/L"]:
            prev_end_time = parse_time(data[i-1][4])
            if prev_end_time and time(0, 0) < prev_end_time <= time(3, 15):
                new_start_time = (datetime.combine(datetime.min, prev_end_time) + timedelta(minutes=1)).time()
                data[i][2] = new_start_time.strftime("%H:%M")
            data[i][4] = "23:59"
    print("Step 17: Adjusted start times for RD and A/L entries")

    for row in data[1:]:
        if len(row) > 5 and is_time(row[5]):
            time_obj = parse_time(row[5])
            if time_obj:
                formatted_time = time_obj.strftime("%H:%M")
                row[5] = f"(hrs:min)shift length - {formatted_time}"
    print("Step 18: Formatted shift lengths in Column F")

    output_file = file_path.replace('.csv', '_reformatted.csv')
    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(data)

    print(f"All steps completed. Reformatted data saved to {output_file}")

if __name__ == "__main__":
    file_path = input("Enter the full path to your CSV file: ")
    reformat_roster(file_path)
    input("Press Enter to exit...")