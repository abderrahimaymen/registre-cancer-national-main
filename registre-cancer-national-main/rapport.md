# Rapport du Projet : Système de Registre National du Cancer (Wilaya de Tlemcen)

## 1. Présentation Générale
Ce projet est un système d'information complet conçu pour la gestion et le suivi du Registre du Cancer de la Wilaya de Tlemcen. Il vise à numériser, centraliser et fiabiliser la collecte des données épidémiologiques et cliniques sur les patients atteints de cancer, tout en remplaçant/améliorant les systèmes existants comme CanReg5.

Le projet respecte scrupuleusement les standards internationaux d'oncologie et d'épidémiologie :
- **CIM-O-3** (Classification Internationale des Maladies pour l'Oncologie) de l'IARC/OMS.
- **ICD-10** pour la codification globale.
- **TNM (8e édition)** pour la classification des stades tumoraux.
- **CanReg5** (logiciel de référence de l'IARC).

## 2. Architecture et Stack Technologique
L'application est divisée en deux parties principales (Frontend et Backend) et s'appuie sur une base de données relationnelle.

- **Frontend** : Développé en **React + Vite**. Il intègre un routage avancé sécurisé basé sur les rôles (Admin, Médecin, Secrétaire, Laboratoire). Il utilise des bibliothèques telles que `recharts` pour les statistiques dynamiques et `react-leaflet` pour la cartographie des cas (SIG).
- **Backend / Base de données** : API REST avec une base de données **PostgreSQL**. Des fichiers de "seeding" (fichiers `.sql` et analyseurs Python/Excel) sont utilisés pour pré-charger les nomenclatures complexes : wilayas algériennes, référentiel complet des cancers (CIM-O-3), spécialités, et actes de laboratoire.

## 3. Fonctionnalités Principales

Le système est structuré autour des parcours utilisateurs et des rôles métiers de l'hôpital :

### 3.1 Gestion des Patients et Admission (Secrétariat & Accueil)
- **Identification et Géolocalisation** : Saisie des données démographiques essentielles. La géolocalisation précise (commune de résidence) est vitale pour les analyses d'incidence spatiale (SIG).
- **Détection des Doublons** : Mécanismes préventifs et curatifs pour identifier automatiquement si un patient est déjà enregistré dans le système (même avec des fautes de frappe).
- **Gestion des Transferts** : Suivi des patients changeant de structure de soin (ex: transfert vers un autre EPH/EHS).

### 3.2 Dossier Clinique et Données Tumeur (Médecins & Oncologues)
- **Identification de la tumeur** : Saisie stricte et codification CIM-O-3 et ICD-10 obligatoires.
- **Cartographie corporelle (Body Map)** : Interface visuelle pour pointer la localisation des tumeurs.
- **Stade et Traitement** : Enregistrement de l'extension de la maladie (TNM) et des parcours de traitements (Chirurgie, Chimiothérapie, Radiothérapie).
- **Gestion des RCP (Réunions de Concertation Pluridisciplinaire)** : Numérisation des décisions collégiales pour les cas complexes.

### 3.3 Laboratoire d'Anatomopathologie (Laborantins)
- **Tableau de bord dédié** : Réception des requêtes d'examen depuis les services cliniques.
- **Saisie des comptes-rendus** : Remplissage direct des résultats structurés (biopsies, IHC, FISH) qui alimentent automatiquement le dossier clinique du patient en temps réel.

### 3.4 Épidémiologie, Survie et Statistiques (Épidémiologistes & Directeurs)
- **Suivi du statut vital** : Enregistrement des décès ou des rémissions (donnée indispensable pour l'analyse de survie qui fait souvent défaut).
- **Tableaux de bord d'analyse (Analytics)** : Outils avancés générant des graphiques, croisant des données, et mesurant les KPI (complets des dossiers, incidence par type de cancer et par zone).
- **Cartographie** : Heatmaps sur les wilayas et identification des zones à risques géographiques.
- **Génération de Rapports** : Création de rapports périodiques (ex: semestriels) pour la Direction de la Santé et de la Population (DSP).

## 4. Sécurité, Traçabilité et Audit
- **Contrôle d'accès rigoureux** : Chaque utilisateur (National admin, Directeur, Médecin, Laboratoire) dispose de vues limitées à ses propres habilitations (par exemple, seul le médecin voit les détails médicaux sensibles de bout en bout).
- **Audit Trail** : Un journal de bord sécurisé (Audit Log) consigne toutes les modifications critiques (ex: correction d'une erreur de stadification par un médecin) garantissant la traçabilité complète des données.

## 5. Résumé de la Structure des Fichiers Clés
- **`frontend/`** et **`backend/`** : Code source principal de l'application.
- **Fichiers Excel (ex: `Referentiel_Cancers_v3_ICDO3_Complet.xlsx`)** : Contiennent les matrices de référence brutes qui dictent le comportement métier du système.
- **Fichiers Python/JS (`extract_sql_seeds.py`, `run_migrations.js`)** : Scripts utilitaires pour nettoyer, importer et préparer la base de données.
- **`specs_full.txt` / `report.md`** : Documents détaillant le cahier des charges, l'architecture fonctionnelle de l'interface et les scénarios d'usage (ex: du diagnostic à la rémission ou décès).
