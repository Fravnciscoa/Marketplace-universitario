import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPortalPage } from './admin-portal.page';

describe('AdminPortalPage', () => {
  let component: AdminPortalPage;
  let fixture: ComponentFixture<AdminPortalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPortalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
