import random

class WhoAmI:

    playerlist = []
    playersequence  = []
    currentPlayerIdx = 0
    ranking = []


    def __init__(self, players, ):
        self.playerlist = players

        # Create a random sequence in which the players will answer questions
        self.playersequence = random.shuffle(self.playerlist)

    def start(self):
        p = self.getPlayerByIndex(currentPlayerIdx)
        self.currentPlayerIdx += 1
        return p

    def nextPlayer(self):
        if(self.currentPlayerIdx < len(playersequence)):
            p = self.getPlayerByIndex(currentPlayerIdx)
            self.currentPlayerIdx += 1
            return p
        else:
            # Cycle complete
            self.currentPlayerIdx = 0
            return self.getPlayerByIndex(currentPlayerIdx)
        
    def winPlayer(self, pId):
        tar = elf.getPlayerByPid(pId)
        self.playersequence.remove(tar)
        self.ranking.append(tar)

    def getPlayerByIndex(self, pIdx):
        return self.playersequence[pIdx]

    def getPlayerByPid(self, pId):
        for x in self.playersequence:
            if x["pid"] == pId:
                return x
        return -1


        
