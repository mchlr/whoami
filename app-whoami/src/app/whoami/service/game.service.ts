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
            this.myPid = data.id
            this.socket = this.connectSocket(this.myPid);
            this.uiRef.setPlayerList(data.playerlist)

            resolve(data)
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
      case "next-player":
        // TODO: Deselect previous player
        // TODO: Select new player with fancy color
        break;
    }

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
}
