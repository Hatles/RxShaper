import {Type} from "@angular/core";

export interface ComponentRegistryItem {
  name: string;
  type: Type<any>
}
