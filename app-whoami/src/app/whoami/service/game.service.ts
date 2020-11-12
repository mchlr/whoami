import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly baseUri: string = "http://localhost:8000/";

  private myName: string;
  private myPid: string;
  private socket;
  private uiRef;

  public playerlist = [];
  public playerranking = [];


  constructor() { }

  public setUiReference(ui) {
    this.uiRef = ui;
  }

  public registerName(name) {
    return new Promise((resolve, reject) => {
      fetch(this.baseUri + "register/" + name)
        .then(response => response.json())
        .then(data => {
          if (data.status === "success") {
            // Initialize required informations after registering a for yourself;
            this.myName = name;
            this.myPid = data.pid
            this.socket = this.connectSocket(this.myPid);
            this.playerlist = data.playerlist

            console.log("Got new Playerlist", this.playerlist);
            resolve(true)
          }
        });
    });
  }

  public connectSocket(pid) {
    console.log("Connecting Websocket...");

    const ws = new WebSocket("ws://localhost:8000/connect/" + pid);
    ws.onmessage = this.onSocketMessage.bind(this);

    console.log("Connection established successfully!");
    return ws;
  }
  
  private onSocketMessage(msg) {
    console.log("[SOCKET] - Got Message");
    let obj = JSON.parse(msg.data);
    console.log("Parsed Response:");
    console.log(obj);

    switch(obj.type) {
      // Set a new Playerlist
      case "playerlist":
        this.playerlist = obj.data;
        break;
      // Open a Dialog where players can suggest names for the next round
      case "name-poll":
        console.log("Opening Name-Dialog");
        this.uiRef.processNamePoll(); 
        break;
      // Set the targetNames (The ones that need to be guessed) for the players
      case "player-sequence":
        this.addTargetsToPlayers(obj.data);
        break;
      // Hightlight the next player 
      case "next-player":
        this.changeActivePlayer(obj.data);
        break;
      // Open dialog to verify the "guessed" name by another player
      case "challenge-win":
        // Find the initiator by her/his pid;
        let initp = this.playerlist.find(x => x.pid === obj.initiator);
        this.uiRef.processWinChallenge(obj.data, initp.target, initp.name);
        break;
      case "challenge-win-process":
        this.uiRef.setVotingList(obj.data);
        break;
    }
  }

  // This function does IN-PLACE adding of the targetNames
  // Targetnames are the Names, the players have to guess in order to win; 
  private addTargetsToPlayers(obj: any) {
    for(let x of this.playerlist) {
      x["target"] = obj.find(y => x.pid === y.pid).target; 
    }
  }

  private changeActivePlayer(pid){
    this.playerlist.forEach(x => x["isActive"] = false);
    this.playerlist.find(x => x.pid === pid)["isActive"] = true;
  }

  private sendSocketMessage(msg) {

    // Maybe stringify every msg from an object;
    this.socket.send(msg);
  }

  sendStartMessage() {
    this.sendSocketMessage(JSON.stringify({ "type":"game-state", "value":"start" }));
  }

  public sendCorrectAnswer() {
    this.sendSocketMessage(JSON.stringify({ "type":"answer", "value":true }));
  }
  
  public sendWrongAnswer() {
    this.sendSocketMessage(JSON.stringify({ "type":"answer", "value":false }));
  }

  sendNameSuggestion(name: string) {
    this.sendSocketMessage(JSON.stringify({ "type":"name-suggestion", "value":name }));
  }

  sendWinChallenge(name: string) {
    // Set the winVoting-state for the initiator;
    this.uiRef.setWinVotingState(true);
    this.sendSocketMessage(JSON.stringify({ "type":"challenge-win", "value":name }));
  }

  sendWinChallengeResponse(result: boolean) {
    this.sendSocketMessage(JSON.stringify({ "type":"challenge-win-response", "value":result }));
  }
  


  public getSocket() {
    return this.socket;
  }

  public getPlayerList() {
    return this.playerlist;
  }

  public getOwnPid() {
    return this.myPid;
  }
}
