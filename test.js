const { validateDataLayerFromFile } = require("./index");

const jsonValidator = {
    "addToCart": {
        "event": "string",
        "products": {
            "id": "string",
            "nom": "string",
            "prix": "number",
            "quantity": "number"
        }
    },
    "listView":{
      item: "string"
    }
};

const mockDataLayer = [
    {
        event: "addToCart",
        products: [
            { id: "123", nom: "T-shirt", prix: 19.99, quantity: "2" } // ⚠ quantity devrait être un number
        ],
        extraKey: true // ⚠ Clé inattendue
    },
];

validateDataLayerFromFile(mockDataLayer, jsonValidator);