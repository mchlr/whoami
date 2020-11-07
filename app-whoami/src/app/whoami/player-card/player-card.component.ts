import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GameService } from '../service/game.service';
import { ChallengeDialogComponent } from './challenge-dialog/challenge-dialog.component';

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss']
})
export class PlayerCardComponent implements OnInit {

  constructor(
    public service: GameService,
    public dialog: MatDialog
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

  public challengeWin() {
    this.dialog.open(ChallengeDialogComponent).afterClosed().subscribe(result => {
      this.service.sendWinChallenge(result);
    })
  }

  // This function serves only a debug/test purpose. Remove after done;
  public logMe() {
    console.log(this.player)
  }

}
