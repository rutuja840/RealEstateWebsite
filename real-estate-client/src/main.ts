import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

  window.addEventListener('error', (event) => {
  alert(`ERROR: ${event.message}\nFile: ${event.filename}\nLine: ${event.lineno}`);
});

window.addEventListener('unhandledrejection', (event) => {
  alert(`UNHANDLED PROMISE REJECTION: ${event.reason}`);
});
