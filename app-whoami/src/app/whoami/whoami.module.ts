import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OverviewComponent } from './overview/overview.component';
import { PlayerCardComponent } from './player-card/player-card.component';
import { NamePromptComponent } from './name-prompt/name-prompt.component';
import { ChallengeDialogComponent } from './player-card/challenge-dialog/challenge-dialog.component';
import { WinPromptComponent } from './win-prompt/win-prompt.component';
import { WinVoteTrackerComponent } from './win-vote-tracker/win-vote-tracker.component';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';





@NgModule({
  declarations: [
    OverviewComponent,
    PlayerCardComponent,
    NamePromptComponent,
    ChallengeDialogComponent,
    WinPromptComponent,
    WinVoteTrackerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    // Imports for Material-UI;
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  // Dialog Components
  entryComponents: [
    NamePromptComponent,
    ChallengeDialogComponent,
    WinPromptComponent
  ]
})
export class WhoamiModule { }
