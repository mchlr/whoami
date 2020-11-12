import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-win-vote-tracker',
  templateUrl: './win-vote-tracker.component.html',
  styleUrls: ['./win-vote-tracker.component.scss']
})
export class WinVoteTrackerComponent implements OnInit {

  public progress: number = 0;
  public yesVotes: number;
  public noVotes: number;

  @Input() voteResults: any[];
  @Input() totalPlayers: number;
  @Input() voteResult: boolean;

  constructor() { }

  ngOnInit() {}

  ngOnChanges() {
    // Reset counter since this components always gets the full list;
    this.yesVotes = 0;
    this.noVotes = 0;

    // Calculate progress-bar progres and yes/noVotes;
    this.progress = (this.voteResults.length / (this.totalPlayers - 1)) * 100;
    this.voteResults.forEach(i => i.value ? this.yesVotes += 1 : this.noVotes += 1);


    console.log("WinVoteTrackerComponent - ngOnInit()");
    console.log("voteResults: ", this.voteResults);
    console.log("Vote Counts:")
    console.log("YES: " + this.yesVotes);
    console.log("NO: " + this.noVotes);
    console.log("PROGRESS: " + this.progress);
    console.log("==> VOTE RESULT: ", this.voteResult);
  }

}
