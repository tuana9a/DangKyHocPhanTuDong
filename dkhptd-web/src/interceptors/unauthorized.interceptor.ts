import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse
} from "@angular/common/http";

import { EMPTY } from "rxjs";
import { catchError } from "rxjs/operators";
import { IsAuthorizedRepo } from "src/repositories/is-authorized.repo";

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(private isAuthorizedRepo: IsAuthorizedRepo) {

  }
  intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status == 401) {
          this.isAuthorizedRepo.unAuthorized();
        }
        // If you want to return a new response:
        //return of(new HttpResponse({body: [{name: "Default value..."}]}));

        // or just return nothing:
        return EMPTY;
      })
    );
  }
}
