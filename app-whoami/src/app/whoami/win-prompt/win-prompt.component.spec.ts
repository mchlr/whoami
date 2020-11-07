import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WinPromptComponent } from './win-prompt.component';

describe('WinPromptComponent', () => {
  let component: WinPromptComponent;
  let fixture: ComponentFixture<WinPromptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WinPromptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WinPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
