import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-win-prompt',
  templateUrl: './win-prompt.component.html',
  styleUrls: ['./win-prompt.component.scss']
})
export class WinPromptComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<WinPromptComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    console.log("WinPrompt open!");
    console.log(this.data);
  }

}
