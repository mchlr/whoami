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
      case "playerlist":
        this.playerlist = obj.data;
        console.log(this.uiRef.setPlayerList(this.playerlist));
        break;
      case "name-poll":
        console.log("Opening Name-Dialog");
        this.uiRef.processNamePoll(); 
        break;
      case "player-sequence":
        this.addTargetsToPlayers(obj.data);
        break;
      case "next-player":
        this.changeActivePlayer(obj.data);
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
