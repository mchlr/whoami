import asyncio
from datetime import datetime, timedelta
import logging
import time
import os
import jwt
import json
import uvicorn
from uuid import uuid4
from fastapi import FastAPI, WebSocket
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt import PyJWTError
from passlib.context import CryptContext
from pydantic import BaseModel
from starlette.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(
    title="whoami",
    version="0.0.1",
)
# TODO: Restrict origins to the hostname.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], expose_headers=["*"])
LOGGER = logging.getLogger(__name__)
START_TIME = time.time()

# WhoAmI
playerlist = {}


def main():
    """Run through uvicorn when run."""
    uvicorn.run("api_whoami:app", host='0.0.0.0', port=8000, reload=True)


if __name__ == "__main__":
    main()


@app.get("/")
def index():
    return {"status":"Hello World!"}


# Add a new Player
@app.get("/register/{playerName}")
async def registerPlayer(playerName: str):
    pid = str(uuid4())
    playerlist[pid] = {"name": playerName, "connection": None}

    # Update currently connected players
    await sendPlayerlist()
    # Complete registration
    return {"status": "success", "id": pid, "playerlist": [{"id": pid, "name":playerlist[pid]["name"]} for pid in playerlist]}

# Notify current players about a new player
async def sendPlayerlist():
    print("sendPlayerlist()")
    if playerlist.keys() is not []: 
        pl = [{"id": pid, "name":playerlist[pid]["name"]} for pid in playerlist]
        print(pl)
        for pid in playerlist:
            if(playerlist[pid]["connection"] is not None):
                print("Messaging: ", playerlist[pid]["name"])
                await playerlist[pid]["connection"].send_text(json.dumps({"type":"playerlist", "data":pl}))
    else:
        print("No connections yet")



# ********** WebSocket Methods **********

@app.websocket("/connect/{playerId}")
async def websocket_endpoint(playerId: str, websocket: WebSocket):
    print("New Websocket connection from: " + playerlist[playerId]["name"] + " (" + playerId + ")")

    await websocket.accept()
    playerlist[playerId]["connection"] = websocket;

    while True:
        await onMessage(websocket)
        

# ********** Game Methods **********

async def onMessage(socket):

    pid = ""
    for xx in playerlist:
        if(playerlist[xx]["connection"] == socket):
            pid = xx

    print("Getting data from: " + playerlist[pid]["name"])

    # TODO: Create a switch-case that handels the game state according to the received message;

    # data = await socket.receive_json()
    data = await socket.receive_text()

    print("Got Data via WS:")
    print(data["action"])
    print(data.action)

@app.get("/start")
async def startGame():
    # Send a push message to all active players    
    for pid in playerlist: 
        playerlist[pid]["connection"].send_text("""{"game-state": "start"}""")
    while True:
        json = await playerlist[pid]["connection"].receive_json()
        print("Got new JSON via ws:")
        print(json)
