import {ComponentBlock} from "../components/builder/builder.component";

export const components: ComponentBlock[] =
  [
    {
      "id": "test",
      "type": "Block",
      "options": {
        "test": "1",
        "test2": "1"
      },
      bindings: {
        test: 'returnValue(state.test + " value test"); setTimeout(() => console.log("timeout"), 2000);',
        test2: 'console.log(state.test); console.log(state["test"]); const test2 = "value test 2"; returnValue(test2);'
      },
      actions: {
        doSomething: 'state.test = "something done"; console.log("action done");'
      },
      style: {
        large: {
          "background-color": "red",
          "border": "3px solid black",
        }
      },
      class: ['test-class'],
      childrenContainerLayout: "row",
      "children": [
        {
          "type": "Block",
          "options": {
            "test": "1.1",
            "test2": "1.1"
          },
          bindings: {
            test: 'returnValue(fetch("https://jsonplaceholder.typicode.com/todos/1").then(res => res.json()).then(json => JSON.stringify(json)));',
            // test: 'returnValue(fetch("https://jsonplaceholder.typicode.com/todos").then(res => res.json()));',
          },
          // script: 'debugger; const event = state.onChange("test").then((testState) => {debugger; console.log("test changes", testState); return "state intercepted";}); returnValue(event);',
          script: 'state.subscribeOnChanges((changes) => fetch("https://jsonplaceholder.typicode.com/todos/1").then(res => res.json()).then(json => JSON.stringify(json)).then(r => parent.state.test = r));',
          "children": [
            {
              "type": "Block",
              "options": {
                "test": "1.1.1",
                "test2": "1.1.1"
              },
              actions: {
                doSomething: 'parent.state.test = "child set me";',
                mouseenter: 'state.test = event.name;',
                mouseleave: 'state.test = event.name;'
              },
              style: {
                large: {
                  "background-color": "blue",
                  "border": "3px solid yellow",
                }
              },
            },
            {
              "type": "Text",
              "options": {text: 'test text block'},

            //   "children": [
            //     {
            //       "type": "textnode",
            //     }
            //   ]
            }
          ]
        },
        {
          type: "Box",
          style: {
            large: {
              'background-color': 'purple',
              'padding': '30px',
              'margin': '30px'
            }
          },
          children: [
            {
              "type": "Block",
              script: 'state.test = "script works"; console.log("executing script");',
              bindings: {
                test: 'returnValue(parent.state.onChange("test").pipe(rxjs.map(change => "listen parent: "+change.nextValue)))'
              },
              actions: {
                mousemove: 'state.test = event.name + " | screenX:" + event.value.screenX + " | screenY:" + event.value.screenY;'
              },
              "options": {
                "test": "1.2",
                "test2": "1.2"
              }
            }
          ]
        }
      ]
    }
  ];
