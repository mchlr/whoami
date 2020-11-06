import { Component, Input, OnInit } from '@angular/core';
import { GameService } from '../service/game.service';

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss']
})
export class PlayerCardComponent implements OnInit {

  constructor(
    public service: GameService
  ) { }

  @Input() player;


  ngOnInit() {
    console.log("Got Player: ", this.player);
  }

}
