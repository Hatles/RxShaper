------
<div align="center">
  <a href="https://hatles.github.io/RxShaper/">
    <img width="200" src="https://github.com/Hatles/RxShaper/raw/master/logo.png">
  </a>
  <br />
  JSON powered / Dynamic component engine renderer
  <br /><br />

<!--  [![Npm version](https://badge.fury.io/js/%40ngx-formly%2Fcore.svg)](https://npmjs.org/package/@ngx-formly/core) -->
</div>

---

RxShaper is a dynamic (JSON powered) component engine renderer for Angular.

## Features

- 🔥 Automatic forms generation
- 📝 Easy to extend with custom component, wrapper and extension.
- ⚡ Support multiple frameworks:
    - Angular
    - Web Components (TODO)
    - React (TODO)

## Docs

- [Get Started](https://hatles.github.io/RxShaper/) (TODO)
- [Live Demo](https://hatles.github.io/RxShaper/)
- [Exemples](https://hatles.github.io/RxShaper/) (TODO)

**Which Version to use?**

| Angular version | Formly version         |
| --------------- | ---------------------- |
| Angular >= 10    | `@ngx-formly/core@0.x` |

## Quick start

Follow these steps to get started with RxShaper.

1. Install RxShaper packages:

```bash
npm install @rxshaper/core
```

Once installed, `RxShaperModule` will be imported in the `AppModule`:

```ts
import { AppComponent } from './app.component';
import { BrowserModule, BrowserAnimationsModule } from '@angular/core';
import { RxShaperModule } from '@rxshaper/core';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RxShaperModule.forRoot()
  ],
  ...
})
export class AppModule { }
```
The forRoot() call is required at the application's root level. The forRoot() method accept a config argument where you can pass extra config, register a custom component, wrapper and extension.

2. add `rxshaper-renderer` attribute inside a `div` tag to your `AppComponent` template:

```html
<div rxshaper-renderer [components]="components"></div>
```

The `rxshaper-renderer` component is the main container of the renderer, which will build and render components, it accept the following inputs:

- `components`: The components configurations to be rendered.

For more details check [Properties and Options](./guide/properties-options). (TODO)

3. Configure our defined renderer:

```ts
import {Component} from '@angular/core';
import {ComponentBlock} from "@rxshaper/core";

@Component({
  selector: 'app',
  template: `
    <div rxshaper-renderer [components]="components"></div>
  `,
})
export class AppComponent {
  components: ComponentBlock[] = [{
    type: "Box",
    id: "shiny",
    style: {
      large: {
        'background-color': 'white',
        'position': 'absolute',
        'width': '300px',
        'height': '300px',
        'margin-top': '-150px',
        'margin-left': '-150px',
        'border-radius': '150px',
        'opacity': 0.3,
      }
    },
    children: [
      {
        "type": "Text",
        "id": "text2",
        'class': ['scroll-appear'],
        "options": {text: 'test text block appear 1'},
        "style": {
          large: {
            position: 'relative'
          }
        }
      },
      {
        "type": "Text",
        "id": "text3",
        'class': ['scroll-appear'],
        "options": {text: 'test text block appear 2'},
        "style": {
          large: {
            position: 'relative'
          }
        }
      }
    ]
  }];
}
```

That's it, the above example will render a box with two texts.

_todo: add stackblitz exemple_

## Keep In Mind
https://github.com/microsoft/monaco-editor : text code editor

https://rete.js.org/ : workflow code editor

https://editorjs.io/ : js block page editor (single column, no nested block :( )

https://github.com/google/blockly
