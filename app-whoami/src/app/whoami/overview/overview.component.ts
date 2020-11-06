import { Component, OnInit } from '@angular/core';
import { GameService } from '../service/game.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NamePromptComponent } from "../name-prompt/name-prompt.component";


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  constructor(
    public service: GameService,
    public dialog: MatDialog
  ) { }

  public hasSuggestedName = false;
  public playerlist = [];
  

  ngOnInit() {
    this.service.setUiReference(this);
  }

  public registerName(name) {
    console.log("Got new Name: ", name);
    console.log("Haz service: ", this.service);

    // Do stuff with service here;
    this.service.registerName(name);

  }

  public setPlayerList(pl) {
    console.log("Got new Playerlist! ", pl);
    this.playerlist = pl;
  }

  public sendStart() {
    console.log("Emitting start message!")
    this.service.sendStartMessage();
  }

  public answerWrong() {
    console.log("Emitting wrong answer!");
    this.service.sendWrongAnswer();
  }

  public answerCorrect() {
    console.log("Emitting correct answer!");
    this.service.sendCorrectAnswer();
  }

  public processNamePoll() {
    if(!this.hasSuggestedName) {
      this.dialog.open(NamePromptComponent).afterClosed().subscribe(result => {
        this.hasSuggestedName = true;
        this.service.sendNameSuggestion(result);
      })
    }
  }


}
