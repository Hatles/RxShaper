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
      style: {
        large: {
          "background-color": "red",
          "border": "3px solid black",
        }
      },
      class: ['test-class'],
      "children": [
        {
          "type": "Block",
          "options": {
            "test": "1.1",
            "test2": "1.1"
          },
          "children": [
            {
              "type": "Block",
              "options": {
                "test": "1.1.1",
                "test2": "1.1.1"
              },
              style: {
                large: {
                  "background-color": "blue",
                  "border": "3px solid yellow",
                }
              },
            },
            {
              "type": "text",
              "options": {},
              "children": [
                {
                  "type": "textnode",
                }
              ]
            }
          ]
        },
        {
          "type": "Block",
          "options": {
            "test": "1.2",
            "test2": "1.2"
          }
        }
      ]
    }
  ]
