# Guide d'internationalisation Stack Advisor

## ✅ Ce qui a été fait

### 1. Installation et configuration
- ✅ Module `@nuxtjs/i18n` installé
- ✅ Configuration dans `nuxt.config.ts` (locales FR/EN, détection automatique)
- ✅ Fichiers de locales créés : `locales/fr.js` et `locales/en.js`

### 2. Structure des données
- ✅ `config/data.ts` adapté pour séparer les données structurelles des textes
- ✅ Composable `useI18nData.ts` créé pour charger les données avec traductions
- ✅ Toutes les clés de traduction organisées par sections dans les locales

### 3. Composants/Pages dynamis\u00e9s
- ✅ `pages/login.vue` - Complètement internationalisé
- ✅ `layouts/default.vue` - Navigation et textes du layout
- ✅ `components/LanguageSwitcher.vue` - Sélecteur de langue créé

### 4. Modifications apportées à `data.ts`
Le fichier `STACKS` a été remplacé par `STACK_CONFIG` qui contient uniquement les propriétés visuelles (couleurs, infra cost).
Les textes (name, cms, frontend, description) sont maintenant dans les fichiers de locales.

---

## 🔨 Ce qu'il reste à faire

### Pages à dynamiser

#### 1. `pages/estimation/index.vue`

**Textes à remplacer :**
```vue
<!-- Avant -->
<h2>Nouvelle estimation</h2>
<p>Uploadez un document pour une analyse automatique, ou passez directement au questionnaire</p>

<!-- Après -->
<h2>{{ $t('estimation.title') }}</h2>
<p>{{ $t('estimation.subtitle') }}</p>
```

**Utilisation du composable pour les stacks :**
```vue
<script setup lang="ts">
const { getTranslatedStack } = useI18nData()

// Au lieu d'utiliser STACKS[stackId] directement
const stack = computed(() => {
  if (!store.aiAnalysis) return null
  return getTranslatedStack(store.aiAnalysis.complexity.suggestedStack)
})
</script>

<template>
  <div>
    <h3>{{ stack.name }}</h3>
    <p>{{ stack.description }}</p>
  </div>
</template>
```

**Tous les textes à chercher et remplacer :**
- "Upload de document" → `$t('estimation.uploadTitle')`
- "Glissez-déposez votre document ici" → `$t('estimation.uploadDragDrop')`
- "Formats acceptés : PDF..." → `$t('estimation.uploadSubtitle')`
- "Parcourir" → `$t('common.browse')`
- "Upload en cours..." → `$t('estimation.uploading')`
- "Analyse en cours..." → `$t('estimation.analyzing')`
- "Analyser" → `$t('estimation.analyze')`
- "Analysé" → `$t('estimation.analyzed')`
- "Modèle Claude :" → `$t('estimation.modelLabel')`
- "Haiku (rapide)" → `$t('estimation.modelHaiku')`
- "Sonnet (équilibré)" → `$t('estimation.modelSonnet')`
- "Opus (puissant)" → `$t('estimation.modelOpus')`
- "Résumé du brief" → `$t('estimation.viewSummary')`
- "Questions pré-remplies" → `$t('estimation.viewQuestionnaire')`
- "Client" → `$t('estimation.client')`
- "Complexité" → `$t('estimation.complexity')`
- "Contexte" → `$t('estimation.context')`
- "Objectifs" → `$t('estimation.objectives')`
- Etc...

---

#### 2. `pages/estimation/questionnaire.vue`

**Utilisation du composable pour les questions :**
```vue
<script setup lang="ts">
const { getTranslatedQuestions } = useI18nData()
const store = useEstimationStore()

// Charger les questions traduites
const questions = getTranslatedQuestions()

// Utiliser les questions traduites au lieu de QUESTIONS
const currentQuestion = computed(() => questions[store.currentStep])
</script>

<template>
  <div>
    <!-- Progress -->
    <span>{{ $t('questionnaire.questionProgress', { current: store.currentStep + 1, total: questions.length }) }}</span>

    <!-- Question -->
    <h2>{{ currentQuestion.question }}</h2>

    <!-- Options -->
    <button v-for="option in currentQuestion.options" :key="option.value">
      <span>{{ option.label }}</span>
      <p v-if="option.note">{{ option.note }}</p>
    </button>

    <!-- Navigation -->
    <button>{{ $t('common.previous') }}</button>
    <button>{{ $t('common.next') }}</button>
    <button>{{ $t('questionnaire.viewResult') }}</button>
  </div>
</template>
```

**Note importante** : Ajouter `const { t } = useI18n()` dans le script setup pour utiliser les traductions avec interpolation.

---

#### 3. `pages/estimation/result.vue`

**Utilisation des stacks traduites :**
```vue
<script setup lang="ts">
import { STACK_CONFIG } from '~/config/data'
const { t } = useI18n()
const { getTranslatedStack } = useI18nData()

// Au lieu d'importer STACKS
const stack = computed(() => {
  if (!recommendation.value) return null
  return {
    ...STACK_CONFIG[recommendation.value.stack],
    ...getTranslatedStack(recommendation.value.stack)
  }
})
</script>

<template>
  <div>
    <h2>{{ $t('result.title') }}</h2>
    <p>{{ $t('result.subtitle') }}</p>

    <!-- Stack recommendation -->
    <div v-if="stack">
      <span>{{ $t('result.recommended') }}</span>
      <h3>{{ stack.name }}</h3>
      <p>{{ stack.description }}</p>
      <span><strong>{{ $t('result.cms') }} :</strong> {{ stack.cms }}</span>
      <span><strong>{{ $t('result.frontend') }} :</strong> {{ stack.frontend }}</span>
      <p>{{ $t('result.monthlyCost') }} : {{ stack.infraCost.min }} - {{ stack.infraCost.max }} {{ $t('result.perMonth') }}</p>
    </div>

    <!-- Project name -->
    <label>{{ $t('result.projectName') }}</label>
    <input :placeholder="$t('result.projectNamePlaceholder')" />
    <button>{{ store.savedProjectId ? $t('result.updateProject') : $t('result.saveProject') }}</button>

    <!-- Tabs -->
    <button>{{ $t('result.quickEstimation') }}</button>
    <button>{{ $t('result.detailedBudget') }}</button>

    <!-- Quick estimation -->
    <h4>{{ $t('result.estimatedWorkload') }}</h4>
    <span>{{ $t('result.days') }}</span>

    <!-- Detailed budget -->
    <th>{{ $t('result.profile') }}</th>
    <th>{{ $t('result.percentage') }}</th>
    <th>{{ $t('result.dailyRate') }}</th>
    <td>{{ $t('result.subtotal') }}</td>

    <!-- Discount -->
    <h4>{{ $t('result.commercialDiscount') }}</h4>
    <button>{{ $t('result.noDiscount') }}</button>
    <button>{{ $t('result.percentageDiscount') }}</button>
    <button>{{ $t('result.fixedDiscount') }}</button>
    <p>{{ $t('result.budgetBeforeDiscount') }}</p>
    <p>{{ $t('result.discount') }}</p>
    <p>{{ $t('result.finalBudget') }}</p>

    <!-- Export -->
    <button>{{ $t('result.exportPDF') }}</button>
  </div>
</template>
```

---

#### 4. `pages/history.vue`

**Textes à remplacer :**
```vue
<h2>{{ $t('history.title') }}</h2>
<p>{{ $t('history.subtitle') }}</p>
<p>{{ $t('history.noProjects') }}</p>
<p>{{ $t('history.noProjectsDescription') }}</p>
<span>{{ $t('history.createdOn') }}</span>
<span>{{ $t('history.stack') }}</span>
<span>{{ $t('history.workload') }}</span>
<span>{{ $t('history.budget') }}</span>
<span>{{ $t(`history.status.${project.status}`) }}</span>
<button>{{ $t('history.view') }}</button>
<button>{{ $t('common.delete') }}</button>
```

---

#### 5. `components/ChatWithClaude.vue`

**Textes à remplacer :**
```vue
<h3>{{ $t('chat.title') }}</h3>
<p>{{ $t('chat.subtitle') }}</p>
<input :placeholder="$t('chat.placeholder')" />
<button>{{ isChatting ? $t('chat.sending') : $t('chat.send') }}</button>
<button>{{ $t('chat.clearConversation') }}</button>
```

---

## 📝 Pattern général pour dynamiser un fichier

### 1. Identifier tous les textes en dur
Recherchez dans le fichier tous les textes entre guillemets ou balises HTML.

### 2. Remplacer par les clés i18n
```vue
<!-- Avant -->
<h2>Titre en dur</h2>
<p>Description en dur</p>

<!-- Après -->
<h2>{{ $t('section.title') }}</h2>
<p>{{ $t('section.description') }}</p>
```

### 3. Utiliser le composable pour les données dynamiques
```vue
<script setup lang="ts">
const { getTranslatedQuestions, getTranslatedStack } = useI18nData()

// Pour les questions
const questions = getTranslatedQuestions()

// Pour une stack spécifique
const stack = getTranslatedStack('A')
</script>
```

### 4. Interpolation de variables
```vue
<!-- Avec variables -->
<span>{{ $t('questionnaire.questionProgress', { current: 1, total: 7 }) }}</span>
<span>{{ $t('result.averageDailyRate', { rate: 950 }) }}</span>
```

### 5. Accès aux traductions dans le script
```vue
<script setup lang="ts">
const { t } = useI18n()

// Dans une fonction
const showMessage = () => {
  alert(t('common.save'))
}

// Dans un computed
const buttonLabel = computed(() => {
  return isLoading.value ? t('common.loading') : t('common.save')
})
</script>
```

---

## 🧪 Tester vos modifications

1. **Démarrer le serveur** : `npm run dev`

2. **Vérifier le sélecteur de langue** :
   - Dans le layout (sidebar en bas), cliquez sur le sélecteur de langue
   - Changez entre FR et EN
   - Vérifiez que tous les textes changent

3. **Tester chaque page** :
   - Login → Vérifier que tous les textes sont traduits
   - Estimation → Upload, analyse, questionnaire
   - Questionnaire → Questions et options
   - Résultat → Stacks, estimations, chiffrage
   - Historique → Liste des projets

4. **Vérifier la persistance** :
   - Changez la langue
   - Rafraîchissez la page
   - La langue doit rester celle sélectionnée (cookie `i18n_redirected`)

---

## 🐛 Dépannage

### Erreur "Cannot read properties of undefined"
→ Vérifiez que la clé existe dans les fichiers `locales/fr.js` et `locales/en.js`

### Clé affichée au lieu du texte (ex: "estimation.title")
→ La clé n'existe pas dans le fichier de locale, vérifiez l'orthographe

### LanguageSwitcher ne s'affiche pas
→ Vérifiez que le composant est bien importé automatiquement par Nuxt (dossier `components/`)

### Les questions n'ont pas de texte
→ Utilisez `getTranslatedQuestions()` au lieu de `QUESTIONS` directement

### Les stacks n'ont pas de texte
→ Combinez `STACK_CONFIG` avec `getTranslatedStack(stackId)`

---

## 📚 Ressources

- [Documentation Nuxt i18n](https://i18n.nuxtjs.org/)
- [Vue i18n](https://vue-i18n.intlify.dev/)
- Fichiers de référence :
  - `locales/fr.js` - Toutes les clés françaises
  - `locales/en.js` - Toutes les clés anglaises
  - `composables/useI18nData.ts` - Helper pour charger les données traduites
  - `pages/login.vue` - Exemple de page complètement internationalisée
  - `layouts/default.vue` - Exemple de layout internationalisé

---

## ✨ Bonnes pratiques

1. **Organisation des clés** : Groupez par fonctionnalité (auth, estimation, result, etc.)
2. **Nommage cohérent** : Utilisez des noms descriptifs (ex: `questionProgress` au lieu de `qp`)
3. **Réutilisation** : Utilisez `common.*` pour les textes réutilisés (save, cancel, etc.)
4. **Interpolation** : Pour les textes avec variables, utilisez `{ variable }`
5. **Pluralisation** : Si nécessaire, consultez la doc Vue i18n pour gérer le pluriel

---

Bon courage pour la dynamisation des fichiers restants ! 🚀
