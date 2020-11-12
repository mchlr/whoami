from collections import namedtuple
import random
from enum import Enum

# This doesn't seem to be neccessary
class GameState(Enum):
    START = "game-start"
    FINISH = "game-finished"
    NEXT = "player-next"
    PLAYERWIN = "player-win"


class WhoAmI:

    playerlist = {}
    playersequence  = []
    namelist = []
    ranking = []
    currentPlayerIdx = 0

    winChallengerPid = ""
    winChallengeResponses = []

    # Initializes the player "model";
    def addPlayer(self, pid, n):
        self.playerlist[pid] = {
            "name": n,
            "suggestion": None
        }
    
    def removePlayer(self, pid): 
        # Works fine!
        del self.playerlist[pid]
        test = self.getPlayerByPid(pid)
        # TODO: Whats dis
        if test is not 0 or not -1 :
            print("Test? ", test)
            self.playersequence.remove(test)

    def addNameSuggestion(self, pid, n):
        self.playerlist[pid]["suggestion"] = n

        print("Name Suggestion => Playerlist:")
        print(self.playerlist)

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
    def _nextPlayer(self):
        self.nextPlayer(self.getPlayerByIndex(self.currentPlayerIdx)["pid"])

    def nextPlayer(self, pid):
        if(self.getPlayerByIndex(self.currentPlayerIdx)["pid"] is pid):
            self.currentPlayerIdx += 1
            if(self.currentPlayerIdx < len(self.playersequence)):
                return self.getPlayerByIndex(self.currentPlayerIdx)
            else:
                # Cycle complete
                self.currentPlayerIdx = 0
                return self.getPlayerByIndex(self.currentPlayerIdx)

    def addWinChallenge(self, pId):
        self.winChallengerPid = pId

    def addWinChallengeResponse(self, val, pId):
        self.winChallengeResponses.append({"pid": pId, "value": val})
        return self.winChallengeResponses

    def assertWin(self):
        if((len(self.winChallengeResponses) + 1 == len(self.playerlist))):
            tc = 0
            for x in self.winChallengeResponses:
                if(x["value"]):
                    tc += 1

            return (tc / len(self.winChallengeResponses)) >= .5
        else: 
            return None
        
    def resolveWinChallenge(self, isWinner):
        if(isWinner):
            winp = self.getPlayerByPid(self.winChallengerPid)

            print("NEW WINNER:")
            print(winp)

            self.removePlayerFromSequence(winp)
            self.ranking.append(winp)

            print("NEW RANKING:")
            print(self.ranking)
        
        # Reset properties for next win challenge
        self.winChallengerPid = ""
        self.winChallengeResponses = []

    def removePlayerFromSequence(self, player):
        if(self.getCurrentPlayer() == player):
            self._nextPlayer()
        self.playersequence.remove(player)

    def getPlayerByIndex(self, pIdx):
        return self.playersequence[pIdx]

    def getPlayerByPid(self, pId):
        if(len(self.playersequence) > 0):
            for x in self.playersequence:
                print("getPlayerbyPid -> This doesnt seem to work!")
                print(str(x["pid"]) + " == " + str(pId) + " ????")
                if x["pid"] == pId:
                    return x
            return -1
        else:
            return 0

    def getCurrentPlayer(self):
        return self.playersequence[self.currentPlayerIdx]   

    def getPlayerList(self):
        return [{"pid": pid, "name":self.playerlist[pid]["name"]} for pid in self.playerlist]   
    
    def getPlayerCount(self):
        return len(self.playerlist)

    def resetGame(self):
        self.playerlist = {}
        self.playersequence = []
        self.namelist = []
        self.ranking = []
        self.winChallengeResponses = []
        self.currentPlayerIdx = 0
        self.winChallengerPid = ""


        
