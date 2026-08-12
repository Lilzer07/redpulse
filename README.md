# VELOCE — Maison Automobile

Court-métrage interactif en Next.js 15 / React Three Fiber. Quinze scènes,
un seul `<Canvas>` persistant en fond, caméra pilotée par GSAP ScrollTrigger
le long d'une courbe Catmull-Rom (showroom → sortie → route), contenu DOM
(Framer Motion) qui défile par-dessus via Lenis.

C'est une **base neuve**, indépendante de tout projet précédent : nouvelle
identité (VELOCE, accent "ignition orange" plutôt qu'or), nouvelles
voitures procédurales, nouvelle chorégraphie caméra pensée pour ce brief
précis (4 voitures : Ferrari, Lamborghini, McLaren, Porsche — pas de vrais
fichiers `.glb` demandés cette fois, donc pas de dossier `/public/models/`).

## Démarrage

```bash
npm install
npm run dev
```

Ouvre `http://localhost:3000`.

> ⚠️ Écrit dans un environnement sans accès réseau : je n'ai pas pu exécuter
> `npm install` / `next build` moi-même. Teste `npm run build` en local
> avant toute mise en prod.

## Pourquoi des voitures procédurales, pas de vrais modèles 3D ?

Ce brief ne mentionne aucun fichier `.glb` ni source de modèle — contrairement
à un autre projet où des liens Sketchfab précis avaient été fournis. Sans
assets réels à charger, le choix le plus honnête est de construire les
quatre voitures entièrement en géométrie procédurale
(`ProceduralCar.tsx`) plutôt que d'inventer des placeholders qui feraient
semblant d'être un chargement de modèle. Avantage concret : parce que je
contrôle chaque mesh, les portes élytre de la Lamborghini, le capot de la
McLaren et l'aileron de la Porsche s'animent précisément — pas besoin de
deviner des noms de mesh comme ce serait le cas avec un `.glb` externe.

Si tu obtiens de vrais modèles plus tard, le pattern du projet précédent
(`useGLTF` + Draco + fallback procédural + hints de noms de mesh) se
transposerait directement ici.

## Architecture

```
app/
  layout.tsx          → Canvas persistant + Nav + Lenis, une fois
  page.tsx             → assemble les 15 scènes dans l'ordre de scroll
  globals.css          → design tokens + signature "ignition-rule"

src/
  components/canvas/
    Scene.tsx               → <Canvas> racine : 4 voitures, environnements, rig, effets
    ProceduralCar.tsx        → voiture 100% procédurale : portes élytre, capot, aileron
    ShowroomEnvironment.tsx  → sol miroir, HDRI, spots LED, particules, fumée Lamborghini
    RoadEnvironment.tsx      → route de sortie (scène 11) : marquage au sol animé, traînées
    FogController.tsx        → morphe le fog partagé entre showroom et route
    CameraRig.tsx             → scroll → position caméra (Catmull-Rom, 18 keyframes)
    LensFlareSource.tsx       → flare procédural (texture <canvas>, pas d'asset externe)
    Effects.tsx                → Bloom, DepthOfField, ChromaticAberration (blur de vitesse), Vignette, Noise
    SmoothScroll.tsx           → Lenis ↔ ScrollTrigger

  components/sections/     → contenu DOM : scène 1 (intro), 12-15 (services,
                              inventaire, configurateur, contact)
  components/ui/
    Nav.tsx                   → ambiance sonore synthétisée (WebAudio, désactivable)
    CinematicText.tsx         → titres lettre par lettre, flou → net
  store/                    → zustand : scroll/scène active, configurateur
  shaders/
    shaders.ts                → GLSL fait main (balayage LED, fresnel, marquage route)
    materialPresets.ts        → verre / carbone / métal / peinture (PBR)
```

## Scène par scène (brief → implémentation)

| # | Brief | Où | Statut |
|---|---|---|---|
| 1 | Écran noir, moteur, phares, logo, portes | `HeroIntro.tsx` | ✅ son de démarrage synthétisé (WebAudio), phares, portes |
| 2 | Entrée showroom, 3 voitures, reflets | `CameraRig.tsx` (`showroom-entry`) | ✅ (Ferrari centre, Lamborghini droite, McLaren gauche, Porsche au fond) |
| 3 | Orbite Ferrari, roues, étriers, phares, moteur | `ferrari-orbit` + `ProceduralCar.tsx` | ✅ roues tournent, étriers/phares réagissent à la scène ; son moteur = scène 1 uniquement (voir limites) |
| 4 | Traversée carrosserie → cockpit | `ferrari-cockpit` | ✅ caméra macro sur l'habitacle ; pas d'intérieur détaillé modélisé (volant/compteurs stylisés, pas de vrais compteurs animés) |
| 5 | Visite showroom, plusieurs voitures | `showroom-tour` | ✅ plan large révélant les 4 voitures |
| 6 | Lamborghini, portes élytre, éclairage orange, fumée | `lamborghini-reveal` + `ProceduralCar.tsx` | ✅ portes s'ouvrent réellement (rotation de mesh), fumée orange générée en direct |
| 7 | Dessous, freins, échappement, diffuseur, carbone | `lamborghini-underside` | ✅ caméra basse ; détails = matériaux carbone/métal, pas de géométrie mécanique détaillée |
| 8 | McLaren, capot, vue moteur | `mclaren-reveal` / `mclaren-hood` + `ProceduralCar.tsx` | ✅ capot s'ouvre réellement, bloc moteur stylisé qui s'illumine |
| 9 | Porsche, aileron, feux, vue arrière | `porsche-reveal` / `porsche-rear` | ✅ aileron se déploie (translation de mesh), feux arrière |
| 10 | Sortie, porte, la voiture démarre | `showroom-exit` | ✅ caméra chorégraphiée vers la sortie ; pas de porte de garage physique modélisée (transition par fondu de fog) |
| 11 | Route, motion blur, drone | `road-drive` + `RoadEnvironment.tsx` | ✅ marquage au sol animé, traînées lumineuses, aberration chromatique amplifiée (stand-in pour un vrai motion blur, voir limites) |
| 12 | Retour garage, services | `ServicesSection.tsx` | ✅ complet |
| 13 | Inventaire, cartes hover 3D | `InventoryCards.tsx` | ✅ complet |
| 14 | Configurateur temps réel | `Configurator.tsx` + `useConfigurator.ts` | ✅ couleur, étriers, jantes, intérieur (liste), pack carbone — couleur/étriers/jantes visibles en direct sur le modèle 3D |
| 15 | Contact, showroom, bouton, formulaire | `ContactSection.tsx` | ✅ complet (formulaire à brancher sur ton backend) |

## Limites honnêtes

- **Le son du moteur (scène 1)** est une séquence WebAudio synthétisée
  (crank + montée en régime), pas un enregistrement réel — et les
  navigateurs bloquent l'audio avant tout geste utilisateur : elle peut ne
  pas se déclencher automatiquement selon le navigateur. Le bouton
  "Ambiance" dans la nav reste le moyen fiable d'entendre quelque chose.
- **Intérieur cockpit (scène 4)** : la caméra fait bien le plan macro, mais
  il n'y a pas de volant/compteurs modélisés en détail — c'est un habitacle
  stylisé (vitrage + carrosserie), pas une scène d'intérieur dédiée.
- **Motion blur (scène 11)** simulé via `ChromaticAberration` amplifiée +
  traînées lumineuses, pas un vrai buffer de vélocité par pixel.
- **SSR** remplacé par `MeshReflectorMaterial` (sol miroir planaire), plus
  fiable en production que le SSR postprocessing.
- **Intérieur du configurateur** (cuir noir/cognac/alcantara) : les options
  existent dans le store et l'UI, mais rien n'est câblé visuellement dessus
  puisqu'il n'y a pas d'intérieur modélisé pour l'instant.
- **Non testé / build non exécuté** — voir avertissement plus haut.

## Prochaines étapes suggérées

1. `npm install`, `npm run dev`, vérifier la chorégraphie caméra à ton
   rythme de scroll préféré (ajuster `KEYFRAMES` dans `CameraRig.tsx` et la
   hauteur de piste dans `ShowroomCaptions.tsx` si besoin).
2. Si tu obtiens de vrais modèles 3D plus tard, transposer le pattern
   `useGLTF` + Draco + fallback du projet précédent par-dessus
   `ProceduralCar.tsx` (garder les hinges de portes/capot/aileron comme
   groupes nommés dans le `.glb` pour réutiliser la même logique
   d'animation).
3. Modéliser ou importer un vrai intérieur pour la scène 4 (volant,
   compteurs, écrans) si ce plan doit devenir un vrai moment du film.
4. Remplacer le formulaire de `ContactSection.tsx` par un vrai provider.
