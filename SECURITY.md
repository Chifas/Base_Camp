# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| latest (`develop`) | ✅ |
| older releases | ❌ |

Only the latest version on the `develop` branch receives security fixes.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Use [GitHub private vulnerability disclosure](https://github.com/chifas/base_camp/security/advisories/new) to report security issues confidentially.

Include as much of the following information as possible:

- Type of issue (e.g. SQL injection, XSS, authentication bypass, CSRF)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag, branch, commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Response Timeline

We aim to acknowledge receipt of your report within **72 hours** and will keep you informed as the issue is investigated and resolved. We treat all security reports seriously and will work with you to understand and address the issue promptly.

## Scope

The following are **in scope**:

- Authentication and session management flaws
- SQL injection, XSS, CSRF vulnerabilities
- Privilege escalation or unauthorized data access
- Sensitive data exposure (credentials, personal data)
- Rate limiting bypasses

The following are **out of scope**:

- Denial of service attacks
- Spam or social engineering
- Issues in third-party dependencies (report those upstream)
- Issues requiring physical access to a user's device
