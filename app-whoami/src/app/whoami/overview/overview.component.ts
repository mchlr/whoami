import { Component, OnInit } from '@angular/core';
import { GameService } from '../service/game.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  constructor(
    public service: GameService
  ) { }

  public name: string = "Peter"; 

  public displayName;
  public playerlist = ["Keiner da! :("];


  ngOnInit() {
    this.service.setUiReference(this);
  }

  public registerName(name) {
    console.log("Got new Name: ", name);
    console.log("Haz service: ", this.service);


    // Do stuff with service here;
    this.service.registerName(name).then(x => {
      console.log(this.service.getSocket());
    });

  }

  public setPlayerList(pl) {
    console.log("Got new Playerlist! ", pl);
    this.playerlist = pl;
  }

}
