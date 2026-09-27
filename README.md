# RealiMeali

RealiMeali is a meal planning and recipe management app built with React, TypeScript, Vite and Supabase.

## Development

### Requirements

- Node.js
- npm

### Install

```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### Run locally

```sh
npm run dev
```

The app uses Vite for the frontend, Supabase for backend services and TypeScript/React for the application.

## Code standards

### UK spelling

RealiMeali uses UK English spelling in user-facing text.

Common examples:

- `colour` not `color`
- `organise` not `organize`
- `centre` not `center`
- `favourite` not `favorite`
- `recognise` not `recognize`
- `behaviour` not `behavior`
- `licence` (noun) / `license` (verb)
- `defence` not `defense`
- `travelled` not `traveled`
- `cancelled` not `canceled`

Spell checking is available with:

```sh
npm run lint:spell
```

Run the full lint suite with:

```sh
npm run lint:all
```

## Build

```sh
npm run build
```

GitHub Actions runs the build check for changes pushed to `main`.

## Deployment

The production site is deployed from the GitHub repository to the configured hosting environment. The production domain is:

https://realimeali.com/
