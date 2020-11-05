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
    console.log("[SOCKET]: ", msg);
    let obj = JSON.parse(msg.data);
    console.log("Parsed Response:");
    console.log(obj);

    switch(obj.type) {
      case "playerlist":
        this.playerlist = obj.data;
        console.log(this.uiRef.setPlayerList(this.playerlist));
        break;
    }

  }

  private sendSocketMessage(msg) {

    // Maybe stringify every msg from an object;
    this.socket.send(msg);
  }


  public getSocket() {
    return this.socket;
  }

  public getPlayerList() {
    return this.playerlist;
  }
}
