const fs = require('fs');
const path = require('path');

/**
 * Script pour automatiser la dynamisation des textes en dur
 */

// Mappings de remplacement pour result.vue
const resultReplacements = [
  // Header
  ['<h2 class="text-3xl font-bold text-slate-800">Recommandation</h2>', '<h2 class="text-3xl font-bold text-slate-800">{{ $t(\'result.title\') }}</h2>'],
  ['<p class="text-slate-500 mt-1">Basée sur vos réponses au questionnaire</p>', '<p class="text-slate-500 mt-1">{{ $t(\'result.subtitle\') }}</p>'],
  ['<button @click="handleNewEstimation" class="btn-secondary">\n          Nouvelle Props\n        </button>', '<button @click="handleNewEstimation" class="btn-secondary">\n          {{ $t(\'nav.newEstimation\') }}\n        </button>'],

  // Loading
  ['<p class="text-slate-500 mt-4">Chargement de la grille TJM...</p>', '<p class="text-slate-500 mt-4">{{ $t(\'result.loadingRates\') }}</p>'],

  // Stack recommendation
  ['Recommandé', '{{ $t(\'result.recommended\') }}'],
  ['Infra mensuelle', '{{ $t(\'result.monthlyCost\') }}'],
  ['€/mois', '{{ $t(\'result.perMonth\') }}'],
  ['<strong>CMS :</strong>', '<strong>{{ $t(\'result.cms\') }} :</strong>'],
  ['<strong>Frontend :</strong>', '<strong>{{ $t(\'result.frontend\') }} :</strong>'],

  // Project name
  ['Nom du projet', '{{ $t(\'result.projectName\') }}'],
  ['Ex: Site corporate Acme Inc.', '{{ $t(\'result.projectNamePlaceholder\') }}'],
  ['Sauvegarder', '{{ $t(\'common.save\') }}'],
  ['Mettre à jour', '{{ $t(\'result.updateProject\') }}'],
  ['✓ Projet sauvegardé avec succès', '{{ $t(\'result.projectSaved\') }}'],

  // Tabs
  ['Estimation rapide', '{{ $t(\'result.quickEstimation\') }}'],
  ['Chiffrage détaillé', '{{ $t(\'result.detailedBudget\') }}'],

  // Quick estimation
  ['Charge estimée', '{{ $t(\'result.estimatedWorkload\') }}'],
  ['jours', '{{ $t(\'result.days\') }}'],
  ['Budget estimé', '{{ $t(\'result.estimatedBudget\') }}'],

  // Detailed budget table headers
  ['Profil', '{{ $t(\'result.profile\') }}'],
  ['%', '{{ $t(\'result.percentage\') }}'],
  ['TJM', '{{ $t(\'result.dailyRate\') }}'],
  ['Total', '{{ $t(\'result.total\') }}'],
  ['SOUS-TOTAL', '{{ $t(\'result.subtotal\') }}'],

  // Buttons
  ['Réinitialiser %', '{{ $t(\'result.resetPercentages\') }}'],
  ['Réinitialiser TJM', '{{ $t(\'result.resetRates\') }}'],

  // Discount
  ['Remise commerciale', '{{ $t(\'result.commercialDiscount\') }}'],
  ['Aucune', '{{ $t(\'result.noDiscount\') }}'],
  ['Pourcentage', '{{ $t(\'result.percentageDiscount\') }}'],
  ['Montant fixe', '{{ $t(\'result.fixedDiscount\') }}'],
  ['Budget avant remise', '{{ $t(\'result.budgetBeforeDiscount\') }}'],
  ['Remise', '{{ $t(\'result.discount\') }}'],
  ['Budget final HT', '{{ $t(\'result.finalBudget\') }}'],

  // Export
  ['Exporter PDF', '{{ $t(\'result.exportPDF\') }}'],
  ['Export PDF - Fonctionnalité à implémenter', '{{ $t(\'result.exportPDFNotImplemented\') }}'],

  // Warning messages
  ['Questionnaire incomplet', '{{ $t(\'result.incompleteQuestionnaire\') }}'],
  ['Vous devez d\'abord compléter le questionnaire pour voir les recommandations et estimations.', '{{ $t(\'result.incompleteMessage\') }}'],
  ['Compléter le questionnaire', '{{ $t(\'result.completeQuestionnaire\') }}'],
];

// Mappings de remplacement pour history.vue
const historyReplacements = [
  ['Historique des projets', '{{ $t(\'history.title\') }}'],
  ['Vos projets sauvegardés', '{{ $t(\'history.subtitle\') }}'],
  ['Aucun projet sauvegardé', '{{ $t(\'history.noProjects\') }}'],
  ['Commencez par créer une nouvelle estimation', '{{ $t(\'history.noProjectsDescription\') }}'],
  ['Créé le', '{{ $t(\'history.createdOn\') }}'],
  ['Stack', '{{ $t(\'history.stack\') }}'],
  ['Charge', '{{ $t(\'history.workload\') }}'],
  ['Budget', '{{ $t(\'history.budget\') }}'],
  ['Voir', '{{ $t(\'history.view\') }}'],
];

// Mappings pour ChatWithClaude.vue
const chatReplacements = [
  ['Discuter avec Claude', '{{ $t(\'chat.title\') }}'],
  ['Affinez votre analyse en posant des questions', '{{ $t(\'chat.subtitle\') }}'],
  ['Posez une question sur le projet...', '{{ $t(\'chat.placeholder\') }}'],
  ['Envoyer', '{{ $t(\'chat.send\') }}'],
  ['Envoi...', '{{ $t(\'chat.sending\') }}'],
  ['Effacer la conversation', '{{ $t(\'chat.clearConversation\') }}'],
];

function applyReplacements(filePath, replacements) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  replacements.forEach(([search, replace]) => {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = (content.match(regex) || []).length;
    if (matches > 0) {
      content = content.replace(regex, replace);
      changeCount += matches;
      console.log(`  ✓ Replaced "${search.substring(0, 50)}..." (${matches} occurrence(s))`);
    }
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Done! Applied ${changeCount} replacements to ${path.basename(filePath)}\n`);
}

// Apply to result.vue
// applyReplacements(
//   path.join(__dirname, 'pages/estimation/result.vue'),
//   resultReplacements
// );

// Apply to history.vue
applyReplacements(
  path.join(__dirname, 'pages/history.vue'),
  historyReplacements
);

// Apply to ChatWithClaude.vue
applyReplacements(
  path.join(__dirname, 'components/ChatWithClaude.vue'),
  chatReplacements
);

console.log('🎉 All done! Don\'t forget to test the application.');
