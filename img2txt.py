import cv2
import numpy as np
import calendar
from datetime import date
import pandas as pd

img = cv2.imread("trash.webp")

if img is None:
    raise ValueError("Image could not be read")

hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Cyan/teal boxes
lower_cyan = np.array([80, 40, 40])
upper_cyan = np.array([105, 255, 255])
cyan_mask = cv2.inRange(hsv, lower_cyan, upper_cyan)

# Black boxes
black_mask = cv2.inRange(gray, 0, 60)

def find_date_boxes(mask, colour_name):
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(mask)

    boxes = []

    for i in range(1, num_labels):
        x, y, w, h, area = stats[i]
        cx, cy = centroids[i]

        # These filters are tuned for this image size.
        # Adjust or scale them if image resolution changes.
        if 130 < x < 440 and 150 < y < 630:
            if 8 <= w <= 20 and 8 <= h <= 20 and area > 50:
                boxes.append({
                    "colour": colour_name,
                    "x": int(x),
                    "y": int(y),
                    "w": int(w),
                    "h": int(h),
                    "cx": float(cx),
                    "cy": float(cy),
                })

    return boxes

cyan_boxes = find_date_boxes(cyan_mask, "cyan")
black_boxes = find_date_boxes(black_mask, "black")

all_boxes = cyan_boxes + black_boxes

YEAR = 2026

# Your uploaded image size was 591 x 833.
# This scaling keeps the layout working even if the image is resized.
BASE_W, BASE_H = 591, 833
img_h, img_w = img.shape[:2]

sx = img_w / BASE_W
sy = img_h / BASE_H

# Approximate calendar cell size in the original image
CELL_W = 11.8 * sx
CELL_H = 11.8 * sy

# Month layout:
# x0 = centre of Monday column
# y0 = centre of first week row
# These are tuned for your AES calendar layout.
MONTH_LAYOUTS = {
    1:  (153.0 * sx, 172.7 * sy),   # January
    2:  (258.0 * sx, 172.7 * sy),   # February
    3:  (363.1 * sx, 172.7 * sy),   # March

    4:  (153.0 * sx, 298.2 * sy),   # April
    5:  (258.0 * sx, 298.2 * sy),   # May
    6:  (363.1 * sx, 297.7 * sy),   # June

    7:  (153.0 * sx, 424.2 * sy),   # July
    8:  (258.0 * sx, 424.2 * sy),   # August
    9:  (363.0 * sx, 437.0 * sy),   # September

    10: (153.0 * sx, 550.3 * sy),   # October
    11: (258.0 * sx, 562.6 * sy),   # November
    12: (363.1 * sx, 563.0 * sy),   # December
}

BIN_TYPE = {
    "cyan": "recycling_compost",
    "black": "waste"
}

cal = calendar.Calendar(firstweekday=0)  # Monday first
results = []

for box in all_boxes:
    cx = box["cx"]
    cy = box["cy"]
    colour = box["colour"]

    possible_matches = []

    for month_num, (x0, y0) in MONTH_LAYOUTS.items():
        col = round((cx - x0) / CELL_W)
        row = round((cy - y0) / CELL_H)

        if 0 <= col <= 6 and 0 <= row <= 5:
            expected_x = x0 + col * CELL_W
            expected_y = y0 + row * CELL_H

            distance = (
                ((cx - expected_x) / CELL_W) ** 2
                + ((cy - expected_y) / CELL_H) ** 2
            )

            possible_matches.append((distance, month_num, row, col))

    if not possible_matches:
        continue

    _, month_num, row, col = min(possible_matches)

    weeks = cal.monthdayscalendar(YEAR, month_num)

    if row >= len(weeks):
        continue

    day_num = weeks[row][col]

    if day_num == 0:
        continue

    collection_date = date(YEAR, month_num, day_num)

    results.append({
        "year": YEAR,
        "month": calendar.month_name[month_num],
        "day": day_num,
        "weekday": collection_date.strftime("%A"),
        "collection_date": collection_date.isoformat(),
        "exact_day_date": collection_date.strftime("%A, %d %B %Y"),
        "box_colour": colour,
        "bin_type": BIN_TYPE.get(colour, "unknown")
    })

df = pd.DataFrame(results)

df = df.sort_values(["collection_date", "bin_type"]).reset_index(drop=True)

print(df)

df["reminder_day_before"] = pd.to_datetime(df["collection_date"]) - pd.Timedelta(days=1)
df["reminder_same_day"] = pd.to_datetime(df["collection_date"])