import {Injectable} from "@angular/core";

export interface RouteData {
  path: string, label: string, data: string
}

@Injectable()
export class TestService {
  data: string;
  routes: RouteData[];
}
