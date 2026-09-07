import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { PropertyList } from './pages/properties/property-list/property-list';
import { PropertyDetails } from './pages/properties/property-details/property-details';
import { Favorites } from './pages/favorites/favorites';
import { Profile } from './pages/profile/profile';
import { PropertySearchComponent } from './pages/properties/property-search/property-search';
import { Dashboard } from './pages/agent/dashboard/dashboard';
import { MyProperties } from './pages/agent/my-properties/my-properties';
import { AddProperty } from './pages/agent/add-property/add-property';
import { EditProperty } from './pages/agent/edit-property/edit-property';
import { AgentInquiries } from './pages/agent/inquiries/inquiries';
import { authGuard } from './guards/auth-guard';
import { agentGuard } from './guards/agent-guard';
import { Chat } from './pages/chat/chat';


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },

  {
    path: 'home',
    component: Home
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },

  {
    path: 'properties',
    component: PropertyList
  },

  {
    path: 'properties/search',
    component: PropertySearchComponent
  },

  {
    path: 'properties/:id',
    component: PropertyDetails
  },

  {
    path: 'favorites',
    component: Favorites,
    canActivate: [authGuard]
  },

  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },

  {
    path: 'chat/:conversationId',
    component: Chat,
    canActivate: [authGuard]
  },

  {
    path: 'agent',
    component: Dashboard,
    canActivate: [agentGuard]
  },

  {
    path: 'agent/properties',
    component: MyProperties,
    canActivate: [agentGuard]
  },

  {
    path: 'agent/properties/new',
    component: AddProperty,
    canActivate: [agentGuard]
  },

  {
    path: 'agent/properties/:id/edit',
    component: EditProperty,
    canActivate: [agentGuard]
  },

  {
    path: 'agent/inquiries',
    component: AgentInquiries,
    canActivate: [agentGuard]
  },

  {
    path: '**',
    redirectTo: 'home'
  }

];