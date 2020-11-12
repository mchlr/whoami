import { Component, OnInit } from '@angular/core';
import { GameService } from '../service/game.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NamePromptComponent } from "../name-prompt/name-prompt.component";
import { WinPromptComponent } from '../win-prompt/win-prompt.component';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  
  public hasSuggestedName = false;

  public winVoting = false;
  public votinglist = []

  constructor(
    public service: GameService,
    public dialog: MatDialog
  ) { }


  ngOnInit() {
    this.service.setUiReference(this);

    // DEBUG OPTIONS
    // this.votinglist = [{"pid": 123, "value": false}, {"pid": 123, "value": false}, {"pid": 123, "value": false},
    // {"pid": 123, "value": true},{"pid": 123, "value": true},{"pid": 123, "value": true},{"pid": 123, "value": true},{"pid": 123, "value": true}];
    // this.winVoting = true;
  }

  public registerName(name) {
    console.log("Got new Name: ", name);
    console.log("Haz service: ", this.service);

    // Do stuff with service here;
    this.service.registerName(name);

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
    if (!this.hasSuggestedName) {
      this.dialog.open(NamePromptComponent).beforeClosed().subscribe(result => {
        if(result !== undefined && !this.hasSuggestedName) {
          this.hasSuggestedName = true;
          this.service.sendNameSuggestion(result);
        }
        else {
          // Prevent the dialog from closing;
          this.processNamePoll();
        }
      })
    }
  }

  public processWinChallenge(nProp, nActual, initName) {
    // nProp = Name Proposed 
    this.dialog.open(WinPromptComponent, {
      data: { "challengeName": nProp, "actualName": nActual, "initiatorName": initName }
    }).beforeClosed().subscribe(result => {
      if(result !== undefined) {
        console.log("WinPrompt closed! Result: ", result);
        this.service.sendWinChallengeResponse(result);
        this.winVoting = true
      }
      else {
        this.processWinChallenge(nProp, nActual, initName);
      }

    })
  }

  public setWinVotingState(s) {
    this.winVoting = s;
  }
  
  public setVotingList(list) {
    console.log("Got new Votinglist: ", list);
    this.votinglist = list;
  }





}
