import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from "@angular/common/http";

import { throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { ToastMessagesRepo } from "src/repositories/toast-messages.repo";

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private toastMessagesRepo: ToastMessagesRepo) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        this.toastMessagesRepo.add(error.message);
        // If you want to return a new response:
        //return of(new HttpResponse({body: [{name: "Default value..."}]}));

        // If you want to return the error on the upper level:
        return throwError(() => error);
      })
    );
  }
}
