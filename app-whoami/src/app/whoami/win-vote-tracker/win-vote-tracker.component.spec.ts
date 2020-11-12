import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinVoteTrackerComponent } from './win-vote-tracker.component';

describe('WinVoteTrackerComponent', () => {
  let component: WinVoteTrackerComponent;
  let fixture: ComponentFixture<WinVoteTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinVoteTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinVoteTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
