/**
 * Rules Engine - Main Entry Point
 *
 * The composable rules engine for Lootly/Rewards Pirate.
 * Handles evaluation of rules against customer actions and awards.
 */

const { RulesEvaluator } = require('./evaluator');
const { generatePlainLanguage } = require('./plain-language');
const { RulesSimulator } = require('./simulator');
const conditions = require('./conditions');
const awards = require('./awards');

module.exports = {
  RulesEvaluator,
  RulesSimulator,
  generatePlainLanguage,
  conditions,
  awards,
};
