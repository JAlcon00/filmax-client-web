import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { authTokenInterceptor } from './app/core/interceptors/auth-token.interceptor';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(withInterceptors([authTokenInterceptor]))],
}).catch((err) => console.error(err));
