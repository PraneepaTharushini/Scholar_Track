#!/bin/bash
apt-get update && apt-get install -y tesseract-ocr
python -m spacy download en_core_web_sm
cd backend
gunicorn --bind=0.0.0.0 --timeout 600 run:app
