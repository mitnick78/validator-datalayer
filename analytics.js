// let window = {
//     dataLayer: []
// }

window.dataLayer = [
    {
        event: "addToCart",
        products: [
            { id: "123", nom: "T-shirt", prix: 19.99, quantity: "2" } 
        ],
        extraKey: true 
    }
];

function validateEvent(event, schema, eventIndex) {
    let errors = [];

    // Vérifier si toutes les clés sont bien présentes et correctement nommées
    const eventKeys = Object.keys(event);
    const schemaKeys = Object.keys(schema);

    // Vérifier les clés manquantes
    schemaKeys.forEach(key => {
        if (!eventKeys.includes(key)) {
            errors.push(`Événement ${eventIndex} (${event.event}) ➝ Clé manquante : "${key}"`);
        } else {
            const expectedType = schema[key];
            const actualType = Array.isArray(event[key]) ? "array" : typeof event[key];

            if (expectedType !== actualType) {
                errors.push(`Événement ${eventIndex} (${event.event}) ➝ Mauvais type pour "${key}" : attendu "${expectedType}", obtenu "${actualType}"`);
            }
        }
    });

    // Vérifier les clés en trop
    eventKeys.forEach(key => {
        if (!schemaKeys.includes(key)) {
            errors.push(`Événement ${eventIndex} (${event.event}) ➝ Clé inattendue : "${key}"`);
        }
    });

    return errors;
}

function validateArray(items, schema, parentKey, eventIndex, eventName) {
    let errors = [];

    items.forEach((item, index) => {
        const itemKeys = Object.keys(item);
        const schemaKeys = Object.keys(schema);

        // Vérifier les clés manquantes
        schemaKeys.forEach(key => {
            if (!itemKeys.includes(key)) {
                errors.push(`Événement ${eventIndex} (${eventName}) ➝ ${parentKey}[${index}] ➝ Clé manquante : "${key}"`);
            } else {
                const expectedType = schema[key];
                const actualType = Array.isArray(item[key]) ? "array" : typeof item[key];

                if (expectedType !== actualType) {
                    errors.push(`Événement ${eventIndex} (${eventName}) ➝ ${parentKey}[${index}] ➝ Mauvais type pour "${key}" : attendu "${expectedType}", obtenu "${actualType}"`);
                }
            }
        });

        // Vérifier les clés en trop
        itemKeys.forEach(key => {
            if (!schemaKeys.includes(key)) {
                errors.push(`Événement ${eventIndex} (${eventName}) ➝ ${parentKey}[${index}] ➝ Clé inattendue : "${key}"`);
            }
        });
    });

    return errors;
}

function validateDataLayer(jsonValidator) {
    if (!window.dataLayer || !Array.isArray(window.dataLayer)) {
        return ["dataLayer non trouvé ou invalide."];
    }

    let allErrors = [];

    window.dataLayer.forEach((event, eventIndex) => {
        const eventName = event.event;
        if (!jsonValidator[eventName]) {
            allErrors.push(`Événement ${eventIndex} (${eventName}) ➝ Événement inconnu dans le jsonValidator`);
            return;
        }

        let errors = validateEvent(event, jsonValidator[eventName], eventIndex);

        // Validation des objets dans un tableau (ex: products)
        if (jsonValidator[eventName].products && Array.isArray(event.products)) {
            errors = errors.concat(validateArray(event.products, jsonValidator[eventName].products, "products", eventIndex, eventName));
        }

        allErrors = allErrors.concat(errors);
    });

    return allErrors;
}


// start Sans fichier JSON
// const jsonValidator = {
//     "addToCart": {
//         "event": "string",
//         "products": {
//             "item_id": "string",
//             "name": "string",
//             "price": "number",
//             "quantity": "number"
//         }
//     },
// };

// const errors = validateDataLayer(jsonValidator);
// if (errors.length > 0) {
//     console.log("🚨 Erreurs détectées dans le dataLayer :");
//     errors.forEach(error => console.log(error));
// } else {
//     console.log("✅ Aucune erreur dans le dataLayer !");
// }
// End Sans fichier JSON

// Charger le fichier JSON
async function loadValidator() {
    try {
        const response = await fetch("validator.json");
        if (!response.ok) throw new Error("Erreur lors du chargement du JSON");

        const jsonValidator = await response.json();
        return jsonValidator;
    } catch (error) {
        console.error("❌ Impossible de charger le validator JSON :", error);
        return null;
    }
}

// Utilisation du fichier JSON
async function validateDataLayerFromFile() {
    const jsonValidator = await loadValidator();
    if (!jsonValidator) return;

    const errors = validateDataLayer(jsonValidator);
    console.log(errors.length > 0 ? "🚨 Erreurs détectées :" : "✅ Aucune erreur !");
    errors.forEach(error => console.log(error));
}

// Appelle la fonction après le chargement de la page
validateDataLayerFromFile();

