import cv2
import random
import sys
import time
    
emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral']

while True:
    # Simulate emotion detection by returning a random emotion
    sys.stdout.write(json.dumps({"emotion":  random.choice(emotions)}) + "\n")
    sys.stdout.flush()
    time.sleep(1)  # Simulate processing time
    