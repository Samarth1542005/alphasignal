from dotenv import load_dotenv
import os

load_dotenv()

APP_NAME = os.getenv("APP_NAME", "AlphaSignal")
DEBUG = os.getenv("DEBUG", "True") == "True"