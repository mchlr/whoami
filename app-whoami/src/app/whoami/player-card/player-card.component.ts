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

  public answerWrong() {
    this.service.sendWrongAnswer();
  }

  public answerCorrect() {
    this.service.sendCorrectAnswer();
  }

  // This function serves only a debug/test purpose. Remove after done;
  public logMe() {
    console.log(this.player)
  }

}
