import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview/overview.component';
import { PlayerCardComponent } from './player-card/player-card.component';

import {MatCardModule} from '@angular/material/card';



@NgModule({
  declarations: [
    OverviewComponent,
    PlayerCardComponent
  ],
  imports: [
    CommonModule,

    // Imports for Material-UI;
    MatCardModule,
  ]
})
export class WhoamiModule { }
