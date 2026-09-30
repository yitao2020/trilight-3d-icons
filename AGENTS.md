# Project maintenance

- This repository is the canonical Trilightlab 3D icon collection. Public site: https://yitao2020.github.io/trilight-3d-icons/ .
- Preserve existing models and their reference views when adding another icon. Each new model must have its own unique entry in models.json and a thumbnail.
- Prefer separate modules for procedural models. Register the factory in main.js; do not mix new geometry into an existing model.
- For imported models, use self-contained GLB files and local relative asset paths. Never store credentials in the static site.
- Use npm run check before delivery. Inspect rendering and test switching between the affected model and an existing model in a browser.
- GitHub Pages is deployed by .github/workflows/pages.yml on main. When publishing is requested, verify the workflow and the public page; a successful push alone is not proof of deployment.
- Update README.md when the maintenance or asset format changes. dist/ and node_modules/ are generated, not committed.
