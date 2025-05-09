import { makeId } from '../utils/Utils.jsx';

export const componentKits = [
    {
        "name":"30 Days Lost in Space",
        "Description": "Small description placeholder",
        "id":1
    },
    {
        "name":"Another Awesome Kit",
        "Description": "Small description placeholder",
        "id":2
    },
    {
        "name":"Another Awesome Kit 2",
        "Description": "Small description placeholder",
        "id":3
    }
];

export const hardcodedComponentOptions = [
    {
        "name": "led",
        "description": "Small description placeholder",
        "id": makeId(4),
        "kit_id":1,
        "attrs": { "rotate":90, "color": "red", "brightness":"100", "flip": "", "value":1, "top": 10, "left": 10 },
    },
    {
        "name": "resistor",
        "id": makeId(4),
        "kit_id":1,
        "description": "Small description placeholder",
        "attrs": { "rotate":0, "value": "321", "top": 10, "left": 10}
    },
    {
        "name": "photoresistor",
        "id": makeId(4),
        "kit_id":1,
        "description": "Small description placeholder",
        "attrs": { "rotate":0, "value": "100", "top": 10, "left": 10}
    },
    {
        "name": "buzzer",
        "id": makeId(4),
        "kit_id":1,
        "description": "Small description placeholder",
        "attrs": { "rotate":0, "hasSignal": true, "top": 10, "left": 10}
    },
    {
        "name": "rotary-encoder",
        "id": makeId(4),
        "kit_id":1,
        "description": "Small description placeholder",
        "attrs": { "rotate":0, "angle":0, "stepSize": 10, "top": 10, "left": 10}
    },
    {
        "name": "rgb-led",
        "id": makeId(4),
        "kit_id":1,
        "description": "Small description placeholder",
        "attrs": { "brightness":100 , "ledRed": 0.5, "ledGreen": 0.5, "ledBlue": 0.5, "top": 10, "left": 10, "rotate":0}
    },
    {
        "name": "dip-switch-3",
        "id": makeId(4),
        "kit_id":1,
        "description": "Small description placeholder",
        "attrs": { "rotate":0, "value": [0,0,0], "top": 10, "left": 10}
    },
    {
        "name": "oled-display",
        "id": makeId(4),
        "kit_id":1,
        "description": "Small description placeholder",
        "attrs": { "rotate":0, "top": 10, "left": 10, "brightness":1.0}
    },
    {
        "name": "custom-keypad",
        "id": makeId(4),
        "kit_id":1,
        "description": "Small description placeholder",
        "attrs": { "rotate":0, "top": 10, "left": 10}
    },
]

export const projectData =
{
    "components":[
        {
            "name": "hero-board",
            "id": "OMGy",
            "attrs": {
                "zIndex": 3,
                "rotate": 0,
                "ledPower": true,
                "top": 155,
                "left": 100
            }
        },
        {
            "id": "FUbW",
            "name": "led",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 0,
                "color": "red",
                "brightness": "100",
                "flip": "",
                "value": 0,
                "top": 74,
                "left": 194
            }
        },
        {
            "id": "DTrm",
            "name": "rotary-encoder",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 0,
                "angle": 0,
                "stepSize": 10,
                "top": 258,
                "left": 454
            }
        },
        {
            "id": "AeTO",
            "name": "buzzer",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 0,
                "hasSignal": true,
                "top": 351,
                "left": 361
            }
        },
        {
            "id": "PLTU",
            "name": "photoresistor",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 0,
                "value": "100",
                "top": 529,
                "left": 445
            }
        },
        {
            "id": "92i1",
            "name": "rgb-led",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "ledRed": 0,
                "ledGreen": 0.05,
                "ledBlue": 0,
                "top": 636,
                "left": 457,
                "rotate": 0
            }
        },
        {
            "id": "gOHO",
            "name": "dip-switch-3",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 0,
                "value": [
                    0,
                    0,
                    0
                ],
                "top": 435,
                "left": 68
            }
        },
        {
            "id": "tEw8",
            "name": "resistor",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 0,
                "value": "321",
                "top": 104,
                "left": 250
            }
        },
        {
            "id": "fxvo",
            "name": "custom-keypad",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 180,
                "top": 17,
                "left": -195
            }
        },
        {
            "id": "y2XB",
            "name": "breadboard-mini",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 0,
                "top": 591,
                "left": 114
            }
        },
        {
            "id": "R4qc",
            "name": "oled-display",
            "description": "Small description placeholder",
            "icon_path": null,
            "created_at": null,
            "updated_at": null,
            "kit_id": 1,
            "attrs": {
                "rotate": 90,
                "top": 414.6,
                "left": -155.5,
                "brightness": 1
            }
        }
    ],
    "connections":[
        {
            "id": "Kvxs",
            "startPin": {
                "x": 202.00005953678053,
                "y": 113.00000304487205,
                "id": "pt-FUbW-C"
            },
            "endPin": {
                "x": 204.998285934763,
                "y": 164.9997280608753,
                "id": "pt-OMGy-GND.1"
            },
            "color": "#ff3333"
        },
        {
            "id": "f1Lm",
            "startPin": {
                "x": 213.00005095843062,
                "y": 113.00000304487205,
                "id": "pt-FUbW-A"
            },
            "endPin": {
                "x": 255.99984377169787,
                "y": 116.00002024130518,
                "id": "pt-tEw8-r1"
            },
            "color": "#1f5e1f"
        },
        {
            "id": "lmTY",
            "startPin": {
                "x": 301.99996418646305,
                "y": 116.00002024130518,
                "id": "pt-tEw8-r2"
            },
            "endPin": {
                "x": 307.3950907400192,
                "y": 164.9997280608753,
                "id": "pt-OMGy-4"
            },
            "color": "#b925c9"
        },
        {
            "id": "pHC0",
            "startPin": {
                "x": 514.5000242174779,
                "y": 339.00000913461616,
                "id": "pt-DTrm-DT"
            },
            "endPin": {
                "x": 316.1750651383925,
                "y": 602.5995717391589,
                "id": "pt-y2XB-tp.16"
            },
            "color": "#ff6600"
        },
        {
            "id": "PQRW",
            "startPin": {
                "x": 480.4991130051888,
                "y": 691.9991911813719,
                "id": "pt-92i1-COM"
            },
            "endPin": {
                "x": 293.59591419884595,
                "y": 659.1976851393767,
                "id": "pt-y2XB-17t.c"
            },
            "color": "#ff0000"
        },
        {
            "id": "Xpv8",
            "startPin": {
                "x": 542.4998981897681,
                "y": 339.00000913461616,
                "id": "pt-DTrm-GND"
            },
            "endPin": {
                "x": 498.99849079182314,
                "y": 684.9994137068007,
                "id": "pt-92i1-B"
            },
            "color": "#000000"
        },
        {
            "id": "c8vU",
            "startPin": {
                "x": 19.900020948153614,
                "y": 122.39999962147874,
                "id": "pt-fxvo-R4"
            },
            "endPin": {
                "x": 159.2002630944796,
                "y": 726.3955106915599,
                "id": "pt-y2XB-3b.h"
            },
            "color": "#852583"
        },
        {
            "id": "q2rU",
            "startPin": {
                "x": -19.99849098562558,
                "y": 479.90003123017146,
                "id": "pt-R4qc-GND"
            },
            "endPin": {
                "x": 168.7999933916132,
                "y": 659.1976851393767,
                "id": "pt-y2XB-4t.c"
            },
            "color": "#852583"
        },
        {
            "id": "Lsim",
            "startPin": {
                "x": 99.99773215584118,
                "y": 504.9982282860313,
                "id": "pt-gOHO-3b"
            },
            "endPin": {
                "x": 207.19862805239555,
                "y": 649.5980503514938,
                "id": "pt-y2XB-8t.b"
            },
            "color": "#00ff00"
        },
        {
            "id": "2hrM",
            "startPin": {
                "x": 397.4001433224211,
                "y": 458.9999806725608,
                "id": "pt-AeTO-bz2"
            },
            "endPin": {
                "x": 274.3964536045787,
                "y": 639.9983200543602,
                "id": "pt-y2XB-15t.a"
            },
            "color": "#3c61e3"
        },
        {
            "id": "MAFH",
            "startPin": {
                "x": 249.79689997571893,
                "y": 348.5940566313331,
                "id": "pt-OMGy-5V"
            },
            "endPin": {
                "x": 267.9167240000704,
                "y": 602.5995717391589,
                "id": "pt-y2XB-tp.12"
            },
            "color": "#dada32"
        },
        {
            "id": "pHQP",
            "startPin": {
                "x": 453.0000895435706,
                "y": 565.999997079192,
                "id": "pt-PLTU-1"
            },
            "endPin": {
                "x": 408.7921047089451,
                "y": 639.9983200543602,
                "id": "pt-y2XB-29t.a"
            },
            "color": "#b925c9"
        }
    ]
}

