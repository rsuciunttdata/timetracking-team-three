import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(App,  appConfig);
bootstrapApplication(App,  {
  providers: [
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient() 
  ]
});