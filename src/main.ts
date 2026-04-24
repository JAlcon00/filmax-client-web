import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { authTokenInterceptor } from './app/core/interceptors/auth-token.interceptor';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(appRoutes), provideHttpClient(withInterceptors([authTokenInterceptor]))],
}).catch((err) => console.error(err));
