import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OverviewComponent } from './overview/overview.component';
import { PlayerCardComponent } from './player-card/player-card.component';
import { NamePromptComponent } from './name-prompt/name-prompt.component';

import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';





@NgModule({
  declarations: [
    OverviewComponent,
    PlayerCardComponent,
    NamePromptComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    // Imports for Material-UI;
    MatCardModule,
    MatDialogModule,
    MatInputModule,
  ],
  // Dialog Components
  entryComponents: [
    NamePromptComponent
  ]
})
export class WhoamiModule { }
