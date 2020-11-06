from collections import namedtuple
import random
from enum import Enum


class GameState(Enum):
    START = "game-start"
    FINISH = "game-finished"
    NEXT = "player-next"
    PLAYERWIN = "player-win"


class WhoAmI:

    playerlist = {}
    playersequence  = []
    namelist = []
    currentPlayerIdx = 0
    ranking = []

    # Initializes the player "model";
    def addPlayer(self, pid, n):
        self.playerlist[pid] = {
            "name": n,
            "suggestion": None
        }

    def addNameSuggestion(self, pid, n):
        self.playerlist[pid]["suggestion"] = n
        return all([self.playerlist[pid]["suggestion"] is not None for pid in self.playerlist])


    def generateSequence(self):
        pSeq = list(self.playerlist.keys())
        random.shuffle(pSeq)
        nSeq = [self.playerlist[pid]["suggestion"] for pid in self.playerlist.keys()]
        random.shuffle(nSeq)

        for x in range(len(pSeq)):
            pid = pSeq[x]
            self.playersequence.append({"pid": pid, "name": self.playerlist[pid]["name"], "target": nSeq[x]})

        return self.playersequence


    # Methods for cycling through players
    def nextPlayer(self):
        self.currentPlayerIdx += 1
        if(self.currentPlayerIdx < len(self.playersequence)):
            return self.getPlayerByIndex(self.currentPlayerIdx)
        else:
            # Cycle complete
            self.currentPlayerIdx = 0
            return self.getPlayerByIndex(self.currentPlayerIdx)


    def getPlayerByIndex(self, pIdx):
        return self.playersequence[pIdx]

    def getPlayerByPid(self, pId):
        for x in self.playersequence:
            if x["pid"] == pId:
                return x
        return -1




    def getCurrentPlayer(self):
        return self.playersequence[self.currentPlayerIdx]   


    def getPlayerList(self):
        return [{"id": pid, "name":self.playerlist[pid]["name"]} for pid in self.playerlist]   
    
    def getPlayerCount(self):
        return len(self.playerlist)


    def winPlayer(self, pId):
        tar = self.getPlayerByPid(pId)
        self.playersequence.remove(tar)
        self.ranking.append(tar)


    


        
