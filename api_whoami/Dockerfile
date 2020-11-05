FROM python:3.7
WORKDIR /api_whoami/
ADD requirements.txt .
RUN pip install -r requirements.txt

ADD . .
RUN pip install .

EXPOSE 8000

CMD start_api_server
