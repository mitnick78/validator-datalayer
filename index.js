const Table = require("cli-table3");

function validateEvent(event, schema, eventIndex) {
    let errors = [];

    const eventKeys = Object.keys(event);
    const schemaKeys = Object.keys(schema);

    schemaKeys.forEach(key => {
        if (!eventKeys.includes(key)) {
            errors.push([event.event, eventIndex, key, "❌ Clé manquante"]);
        } else {
            const expectedType = schema[key];
            const actualType = Array.isArray(event[key]) ? "array" : typeof event[key];

            if (expectedType !== actualType) {
                errors.push([event.event, eventIndex, key, `⚠️ Mauvais type (Attendu: ${expectedType}, Obtenu: ${actualType})`]);
            }
        }
    });

    eventKeys.forEach(key => {
        if (!schemaKeys.includes(key)) {
            errors.push([event.event, eventIndex, key, "⚠️ Clé inattendue"]);
        }
    });

    return errors;
}

function validateArray(items, schema, parentKey, eventIndex, eventName) {
    let errors = [];

    items.forEach((item, index) => {
        const itemKeys = Object.keys(item);
        const schemaKeys = Object.keys(schema);

        schemaKeys.forEach(key => {
            if (!itemKeys.includes(key)) {
                errors.push([eventName, `${eventIndex} ➝ ${parentKey}[${index}]`, key, "❌ Clé manquante"]);
            } else {
                const expectedType = schema[key];
                const actualType = Array.isArray(item[key]) ? "array" : typeof item[key];

                if (expectedType !== actualType) {
                    errors.push([
                        eventName,
                        `${eventIndex} ➝ ${parentKey}[${index}]`,
                        key,
                        `⚠️ Mauvais type (Attendu: ${expectedType}, Obtenu: ${actualType})`
                    ]);
                }
            }
        });

        itemKeys.forEach(key => {
            if (!schemaKeys.includes(key)) {
                errors.push([eventName, `${eventIndex} ➝ ${parentKey}[${index}]`, key, "⚠️ Clé inattendue"]);
            }
        });
    });

    return errors;
}

function validateDataLayer(dataLayer, jsonValidator) {
    if (!Array.isArray(dataLayer)) {
        return [["Aucune donnée", "-", "-", "❌ dataLayer non trouvé ou invalide."]];
    }

    let allErrors = [];
    let eventNamesInDataLayer = dataLayer.map(event => event.event);

    dataLayer.forEach((event, eventIndex) => {
        const eventName = event.event;
        if (!jsonValidator[eventName]) {
            allErrors.push([eventName, eventIndex, "-", "🚨 Événement inconnu dans le jsonValidator"]);
            return;
        }

        let errors = validateEvent(event, jsonValidator[eventName], eventIndex);

        if (jsonValidator[eventName].products && Array.isArray(event.products)) {
            errors = errors.concat(validateArray(event.products, jsonValidator[eventName].products, "products", eventIndex, eventName));
        }

        allErrors = allErrors.concat(errors);
    });

    Object.keys(jsonValidator).forEach(expectedEvent => {
        if (!eventNamesInDataLayer.includes(expectedEvent)) {
            allErrors.push([expectedEvent, "-", "-", "🚨 Événement manquant"]);
        }
    });

    return allErrors;
}

function validateDataLayerFromFile(dataLayer, jsonValidator) {
    if (!jsonValidator) {
        console.error("❌ Le validator JSON est invalide ou non fourni.");
        return;
    }

    const errors = validateDataLayer(dataLayer, jsonValidator);

    if (errors.length > 0) {
        console.log("🚨 Erreurs détectées :");
        const table = new Table({
            head: ["Événement", "Index", "Clé", "Problème"],
            colWidths: [20, 10, 20, 50]
        });

        errors.forEach(error => table.push(error));
        console.log(table.toString());
    } else {
        console.log("✅ Aucune erreur !");
    }

    return errors;
}

module.exports = {
    validateDataLayer,
    validateDataLayerFromFile
};
