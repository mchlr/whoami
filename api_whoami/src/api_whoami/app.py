import asyncio
from datetime import datetime, timedelta
import logging
import time
import os
from typing import List
from whoami import GameState, WhoAmI
import jwt
import json
import uvicorn
from uuid import uuid4
from enum import Enum
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
connections = {}
game = WhoAmI()

class MessageType(Enum):
    STATE = "game-state"
    ANSWER = "answer"
    NAMESUGGESTION = "name-suggestion"

class Actions():
    # tt = type: MessageType
    # val = Actual Value that will be passed to the action
    # pid = PlayerID necessary for some operations
    async def eval(tt, val, pid):
        parsed = MessageType(tt)

        print("\n")
        print("Parsed MessageType: ", parsed)

        if parsed is MessageType.STATE:
            print("=> ProcessState(val)")
            await Actions.ProcessState(val)

        if parsed is MessageType.ANSWER:
            print("=> ProcessAnswer(val)")
            await Actions.ProcessAnswer(val)

        if parsed is MessageType.NAMESUGGESTION:
            print("=> ProcessNameSuggestion(val, pid)")
            await Actions.ProcessNameSuggestion(val, pid)


    async def ProcessState(val):
        if val == "start":
            await sendNamePoll()
            
    async def ProcessAnswer(val):
        if not val:
            game.nextPlayer()
            await sendCurrentPlayer()
        else:
            print("Correct answer recorded! :)")

    async def ProcessNameSuggestion(val, pid):
        print("Now adding Name: ", val, pid)
        if game.addNameSuggestion(pid, val):
            # All players have chosen! Let's start!
            print("asd")
            seq = game.generateSequence()
            print("got new name sequence and stuff")
            print(seq)
            await sendPlayerSequence(seq)


            await sendCurrentPlayer()

        else:
            print("")
        

        

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
    
    connections[pid] = None
    game.addPlayer(pid, playerName)

    # Update currently connected players
    await sendPlayerlist()
    # Complete registration
    return {"status": "success", "id": pid, "playerlist": game.getPlayerList()}




# ********** WebSocket Methods **********

@app.websocket("/connect/{playerId}")
async def websocket_endpoint(playerId: str, websocket: WebSocket):
    await websocket.accept()
    # Store connection for later use
    connections[playerId] = websocket;

    while True:
        await onMessage(websocket)


# Notify current players about a new player
async def sendPlayerlist():
    print("sendPlayerlist()")
    if game.getPlayerCount() > 0: 
        for pid in connections:
            if(connections[pid] is not None):
                await connections[pid].send_text(json.dumps({"type":"playerlist", "data":game.getPlayerList()}))
    else:
        print("No connections yet")


async def sendCurrentPlayer():
    np = game.getCurrentPlayer()

    print("Next player: ", np)
    for pid in connections:
            if(connections[pid] is not None):
                await connections[pid].send_text(json.dumps({"type":"next-player", "data":np}))


async def sendNamePoll():
    print("Polling Names...")
    for pid in connections:
        await connections[pid].send_text(json.dumps({"type":"name-poll", "data":True}))

async def sendPlayerSequence(seq):
    for pid in connections:
        payload = [{"pid": s["pid"], "target": s["target"] if s["pid"] != pid else "???"} for s in seq]
        await connections[pid].send_text(json.dumps({"type":"player-sequence", "data":payload}))



# ********** Game Methods **********

async def onMessage(socket):

    pid = ""
    for xx in connections:
        if(connections[xx] == socket):
            pid = xx

    print("Getting Data from id: ", pid)
    # TODO: Create a switch-case that handels the game state according to the received message;

    # Throws exception, if the socket is closed; 
    data = await socket.receive_json()
    print("Now Testing Actions")
    await Actions.eval(data["type"], data["value"], pid)
    print("Eval done^^")


    print("Got data via ws: ", data)
    MessageType(data["type"])
    
async def startGame():
    # Send a push message to all active players    
    for pid in connections: 
        connections[pid]["connection"].send_text(json.dumps({"type":"gamestate", "value":"start"}))

