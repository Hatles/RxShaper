import {ComponentBlock, ComponentBlockAnimationActions} from "@rxshaper/core";

const testAnimations: ComponentBlockAnimationActions = {
  'mousePos': {
    timelines: {
      x: [
        {
          key: 0,
          effects: [
            {
              type: 'opacity',
              target: 'self',
              options: {
                percent: 0.5
              }
            },
            {
              type: 'opacity',
              target: 'parent',
              options: {
                percent: 0.5
              }
            },
            {
              type: 'move',
              target: '#text1',
              options: {
                x: 0,
                y: 0,
              }
            }
          ]
        },
        {
          key: 0.5,
          effects: [
            {
              type: 'move',
              target: '#text1',
              options: {
                x: '100px',
                y: 0,
              }
            }
          ]
        },
        {
          key: 1,
          effects: [
            {
              type: 'opacity',
              target: 'self',
              options: {
                percent: 1
              }
            },
            {
              type: 'opacity',
              target: 'parent',
              options: {
                percent: 1
              }
            },
            {
              type: 'move',
              target: '#text1',
              options: {
                x: '200px',
                y: '100px',
              }
            }
          ]
        }
      ]
    }
  }
};
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
          "perspective": '500px',
          "padding-bottom": "200px"
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
          style: {
            large: {
             "margin-top": "700px",
            }
          },
          // animationActions: testAnimations,
          bindings: {
            test: 'returnValue(fetch("https://jsonplaceholder.typicode.com/todos/1").then(res => res.json()).then(json => JSON.stringify(json)));',
            // test: 'returnValue(fetch("https://jsonplaceholder.typicode.com/todos").then(res => res.json()));',
          },
          // script: 'debugger; const event = state.onChange("test").then((testState) => {debugger; console.log("test changes", testState); return "state intercepted";}); returnValue(event);',
          script: 'state.subscribeOnChanges((changes) => fetch("https://jsonplaceholder.typicode.com/todos/1").then(res => res.json()).then(json => JSON.stringify(json)).then(r => parent.state.test = r));',
          "children": [
            {
              "type": "Block",
              "id": "appearing",
              "class": ['scroll-appear'],
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
              animationActions: {
                mouseenter: {
                  timeline: [
                    {key: 0, effects: [{type: 'rotate', target: 'self', options: {z: 0}}]},
                    {key: 1000, effects: [{type: 'rotate', target: 'self', options: {z: 180}}]},
                  ]
                },
                mouseleave: {
                  timeline: [
                    {key: 0, effects: [{type: 'rotate', target: 'self', options: {z: 180}}]},
                    {key: 1000, effects: [{type: 'rotate', target: 'self', options: {z: 360}}]},
                  ]
                },
                enterviewport: {
                  target: 'root .scroll-appear',
                  options: {
                    threshold: 1
                  },
                  timeline: [
                    {key: 0, effects: [{type: 'opacity', target: 'self', options: {percent: 0}}]},
                    {key: 1000, effects: [{type: 'opacity', target: 'self', options: {percent: 1}}]},
                    {key: 0, effects: [{type: 'move', target: 'self', options: {y: 100}}]},
                    {key: 1000, effects: [{type: 'move', target: 'self', options: {y: 0}}]},
                  ]
                }
              }
            },
            {
              "type": "Text",
              "id": "text1",
              "options": {text: 'test text block'},
              "style": {
                large: {
                  position: 'relative'
                }
              }
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
              'position': 'relative',
              'background-color': 'purple',
              'padding': '30px',
              'margin': '30px',
              'overflow': 'hidden'
            }
          },
          animationActions: {
            'mousePos': {
              timelines: {
                x: [
                  {
                    key: 0,
                    effects: [
                      {
                        type: 'move',
                        target: '#shiny',
                        options: {
                          x: '100%'
                        }
                      },
                      {
                        type: 'rotate',
                        target: 'self',
                        options: {
                          y: '-5deg'
                        }
                      }
                    ]
                  },
                  {
                    key: 1,
                    effects: [
                      {
                        type: 'move',
                        target: '#shiny',
                        options: {
                          x: '0%'
                        }
                      },
                      {
                        type: 'rotate',
                        target: 'self',
                        options: {
                          y: '5deg'
                        }
                      }
                    ]
                  }
                ],
                y: [
                  {
                    key: 0,
                    effects: [
                      {
                        type: 'move',
                        target: '#shiny',
                        options: {
                          y: '100%'
                        }
                      },
                      {
                        type: 'rotate',
                        target: 'self',
                        options: {
                          x: '5deg'
                        }
                      }
                    ]
                  },
                  {
                    key: 1,
                    effects: [
                      {
                        type: 'move',
                        target: '#shiny',
                        options: {
                          y: '0%'
                        }
                      },
                      {
                        type: 'rotate',
                        target: 'self',
                        options: {
                          x: '-5deg'
                        }
                      }
                    ]
                  }
                ]
              }
            },
            enterviewport: {
              options: {
                threshold: 1
              },
              timeline: [
                {key: 0, effects: [{type: 'opacity', target: 'self', options: {percent: 0}}]},
                {key: 1000, effects: [{type: 'opacity', target: 'self', options: {percent: 1}}]},
                {key: 0, effects: [{type: 'move', target: 'self', options: {y: 100}}]},
                {key: 1000, effects: [{type: 'move', target: 'self', options: {y: 0}}]},
              ]
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
            },
            {
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
                  'filter': 'blur(1.5rem)'
                }
              }
            }
          ]
        },
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
    }
  ];
