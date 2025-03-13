#!/usr/bin/env node

const { program } = require("commander");
const fs = require("fs");
const path = require("path");
const { validateDataLayerFromFile } = require("./index");

// Configuration de la CLI
program
    .version("1.0.0")
    .description("Outil de validation du dataLayer")
    .option("-d, --data <path>", "Chemin du fichier dataLayer.json")
    .option("-v, --validator <path>", "Chemin du fichier validator.json")
    .option("-o, --output <path>", "Chemin du fichier CSV pour l'export des erreurs")
    .parse(process.argv);

const options = program.opts();

if (!options.data || !options.validator) {
    console.error("❌ Veuillez fournir un fichier dataLayer et un fichier validator.");
    process.exit(1);
}

// Charger les fichiers JSON
const loadJsonFile = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error(`❌ Erreur de lecture du fichier ${filePath} :`, error.message);
        process.exit(1);
    }
};

const dataLayer = loadJsonFile(options.data);
const jsonValidator = loadJsonFile(options.validator);

// Valider le dataLayer
const errors = validateDataLayerFromFile(dataLayer, jsonValidator);

// Export en CSV si l'option est fournie
if (options.output) {
    const csvPath = path.resolve(options.output);
    const csvContent = errors.map(error => error.join(";")).join("\n");

    try {
        fs.writeFileSync(csvPath, "Événement;Index;Clé;Problème\n" + csvContent, "utf8");
        console.log(`✅ Fichier CSV exporté : ${csvPath}`);
    } catch (error) {
        console.error("❌ Erreur lors de l'écriture du fichier CSV :", error.message);
        process.exit(1);
    }
}
