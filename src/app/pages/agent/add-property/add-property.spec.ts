import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AddProperty } from './add-property';

describe('AddProperty', () => {
  let component: AddProperty;
  let fixture: ComponentFixture<AddProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProperty],
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddProperty);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
