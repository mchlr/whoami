import asyncio
from datetime import datetime, timedelta
import logging
import time
import os
from typing import List

from starlette.websockets import WebSocketState 
from whoami import GameState, WhoAmI
import jwt
import json
import uvicorn
from uuid import NAMESPACE_X500, uuid4
from enum import Enum
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
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
    WINCHALLENGE = "challenge-win"
    WINCHALLENGERESPONSE = "challenge-win-response"

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
            await Actions.processState(val, pid)

        if parsed is MessageType.ANSWER:
            print("=> ProcessAnswer(val)")
            await Actions.processAnswer(val, pid)

        if parsed is MessageType.NAMESUGGESTION:
            print("=> ProcessNameSuggestion(val, pid)")
            await Actions.processNameSuggestion(val, pid)

        if parsed is MessageType.WINCHALLENGE:
            print("=> ProcessWinChallenge")
            await Actions.challengeWin(val, pid)

        if parsed is MessageType.WINCHALLENGERESPONSE:
            print("Response for win Challenge!")
            await Actions.processWinChallengeResponse(val, pid)


    async def processState(val, pid):
        if val == "start":
            await sendNamePoll()
        if val == "end":
            print("TODO: Implement stuff when the current game is finished")
        
        
        # Create a new MessageType for triggering a complete reset
        '''    
        if val == "reset":
            # Reset the entire game + disconnect everybody
            game.resetGame()
            await manageDisconnect(pid, connections[pid] for pid in connections)
        '''


    async def processAnswer(val, pid):
        if not val:
            game.nextPlayer(pid)
            await sendCurrentPlayer()
        else:
            print("Correct answer recorded! :)")

    async def processNameSuggestion(val, pid):
        if game.addNameSuggestion(pid, val):
            # All players have chosen => LETS GO!
            seq = game.generateSequence()
            await sendPlayerSequence(seq)
            await sendCurrentPlayer()

        else:
            # Not every player has proposed a name yet => Do nothing
            print()

    async def challengeWin(val, pid):
        game.addWinChallenge(pid)
        await sendWinChallenge(pid, val)

    async def processWinChallengeResponse(val, pid):
        await sendWinChallengeResponseInfo(game.addWinChallengeResponse(val, pid))
        ret = game.assertWin()
        if(ret is not None):
            if(ret):
                # Send notification about win to all players
                print(str(pid) + " Win-Challenge has been ACCEPTED!")
                game.resolveWinChallenge(True)
                await sendWinChallengeEnd(True)
            else: 
                print(str(pid) + " Win-Challenge has been REJECTED!")
                game.resolveWinChallenge(False)
                await sendWinChallengeEnd(False)
        else:
            print("Ret == None || Voting still in progress!")
        

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
    return {"status": "success", "pid": pid, "playerlist": game.getPlayerList()}




# ********** WebSocket Methods **********

@app.websocket("/connect/{playerId}")
async def websocket_endpoint(playerId: str, websocket: WebSocket):
    await websocket.accept()
    # Store connection for later use
    connections[playerId] = websocket;

    while True:
        stat = await onMessage(websocket)
        if(not stat):
            print("Breaking onMessage-Loop")
            break


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
    # Send only the next player's pid in order to avoid leaking a targetName
    np = game.getCurrentPlayer()["pid"]
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

async def sendWinChallenge(initPid, name):
    print("Sending win challenge...")
    for pid in connections:
        if pid is not initPid:
            await connections[pid].send_text(json.dumps({"type":"challenge-win", "data":name, "initiator":initPid}))

async def sendWinChallengeResponseInfo(list):
    print("Sending win challenge response informations...")
    for pid in connections:
        await connections[pid].send_text(json.dumps({"type":"challenge-win-process", "data":list}))
            
async def sendWinChallengeEnd(val):
    for pid in connections:
        await connections[pid].send_text(json.dumps({"type":"challenge-win-result", "data":val}))
    




# ********** Socket Disconnect/Message Methods **********

async def onMessage(socket):

    pid = ""
    for xx in connections:
        if(connections[xx] == socket):
            pid = xx

    # Throws exception, if the socket is closed; 
    try:
        if(socket.client_state is WebSocketState.CONNECTED):
            data = await socket.receive_json()
            await Actions.eval(data["type"], data["value"], pid)
            return True

        # Think about not removing a player upon disconnect
        if(socket.client_state is WebSocketState.DISCONNECTED):
            await manageDisconnect(pid, socket)
            return False

    except WebSocketDisconnect:
        await manageDisconnect(pid, socket)
        return False

async def manageDisconnect(pid, socket):
    '''
    TODO: 
    => Currently active player has to be reselected.
    => sendPlayerlist() needs to return the nameselection (=> playersequence) if there is one already present.
    '''

    if(pid in [i["pid"] for i in game.getPlayerList()]):

        print(str(pid) + " disconnected from server.")
        game.removePlayer(pid)
        del connections[pid]
        print("Removed player+connection")

        await socket.close()
        print("Closed connection")
        await sendPlayerlist()
        print("Sent updated playerlist")
        print("----- Disconnect handeld successfully! -----")
    else:
        print("Invalid pid: " + str(pid))
        return 






    