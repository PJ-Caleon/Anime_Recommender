# Ani.Search

A web application to help discover anime based on preference.

Built with **express**, **react**, and **AniList API**.

---

## Table of contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [API Rate Limiting & Caching](#-api-rate-limiting--caching)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Acknowledgments](#-acknowledgments)

---

## Features

1. **Search by title** - Get information on the rating, its genre and what its about
2. **Search by similarity** - Inputting any anime title and it will provide anime similar to the title
3. **Search by genre** - Displays a list of genre
4. **Caching** - it has a caching feature where outputs are saved via cache so when a user searches for the item again. It first checks the cache if it is there to manage the rate limit of AniList which as of now is 30 request per minute (August 3, 2026)
5. **Displays API usage** - At the bottom of a search will show how many api request the user has before waiting for a minute to refresh

## Tech Stack

| Layer               | Tools                        |
| ------------------- | ---------------------------- |
| **Backend**         | Node.js, Express             |
| **Frontend**        | React, Vite                  |
| **API**             | AniList GraphQL API          |
| **Caching**         | JSON file‑based cache        |
| **Version Control** | Git + GitHub Actions (CI/CD) |

## API Rate Limiting & Caching

AniList currently imposes a rate limit of 30 requests per minute. This project includes:

1. Cache storage to avoid repeated requests for the same query
2. Request counter that shows remaining requests before the limit resets

## Deployment

This project is deployed on **Netlify**(frontend) and **Render**(backend)

## Acknowledgments

- AniList API – free and open GraphQL API for anime and manga
- The open‑source community for the tools and inspiration
