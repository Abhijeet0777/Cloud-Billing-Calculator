# Azure Deployment Guide

This project is ready for Azure Static Web Apps. It has no build step because the app is plain HTML, CSS, and JavaScript.

## Files prepared

- `index.html`, `style.css`, `script.js`: app source files
- `staticwebapp.config.json`: Azure Static Web Apps routing, MIME, and security headers
- `.github/workflows/azure-static-web-apps.yml`: GitHub Actions deployment workflow
- `package.json`: convenience scripts

## Recommended deployment: Azure Static Web Apps + GitHub

1. Create a GitHub repository and push this folder to the `main` branch.
2. Open the Azure Portal.
3. Create a new Static Web App.
4. Choose GitHub as the deployment source.
5. Select this repository and branch `main`.
6. Use these build settings:
   - App location: `/`
   - API location: leave empty
   - Output location: leave empty
7. Finish creation. Azure will create or use the workflow file and deploy the site.

## If you already created the Azure Static Web App

Add this GitHub repository secret:

```text
AZURE_STATIC_WEB_APPS_API_TOKEN
```

You can get the token in Azure Portal from the Static Web App overview page by choosing Manage deployment token.

## CLI deployment option

After installing Azure Static Web Apps CLI and signing in:

```bash
swa login
swa deploy . --env production
```

Or deploy with a deployment token:

```bash
swa deploy . --env production --deployment-token <TOKEN>
```

Do not commit deployment tokens to GitHub.
