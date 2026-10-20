# Security policy

## Reporting a vulnerability

Please do not publish exploit details, credentials, personal data, or proof-of-concept requests in a public issue.

Use GitHub's private vulnerability reporting for this repository if it is available. If private reporting is not enabled, contact the repository owner privately through GitHub and request a confidential channel before sending technical details.

Include the affected component, impact, reproduction steps that do not access other users' data, and any suggested mitigation. Do not test against other users or production data without permission.

## Security expectations

- Never commit service-role keys, API keys, SMTP credentials, signing secrets, access tokens, or production database credentials.
- Frontend Supabase publishable/anon keys are public identifiers; database and Storage security must be enforced by RLS, least-privilege grants, and server-side authorization.
- Production Edge Functions must authenticate and authorize callers explicitly. Administrative and maintenance operations must require administrator authorization or a server-only credential.
- Changes to RLS, Storage policies, Edge Functions, auth settings, and deployment workflows require review and verification before release.
