import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { PropertyDetails } from './property-details';

describe('PropertyDetails', () => {
  let component: PropertyDetails;
  let fixture: ComponentFixture<PropertyDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyDetails],
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
