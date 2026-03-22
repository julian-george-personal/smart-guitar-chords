### Smart Guitar Chords

Smart Guitar Chords is a web app that lets you generate and save guitar chords for any tuning, capo, and fret position!

If you're a beginner guitar player, chord charts usually offer all the chords you need. If you're an expert guitar player, you know the fretboard well enough to find any chord voicing you need. Many guitar players, like me, are somewhere in between. I want to use non-standard chord voicings, but it takes me a while to figure them out on the fretboard, especially when I use non-standard tunings. Some websites already solve this problem, but I find them clunky and ill-suited for many of my use cases, so I decided to make my own. I've also enjoyed using this site as a place to keep track of songs I'm writing, especially since the app is designed to be mobile-friendly as well.

#### Architecture

A Bun server handles serving the frontend and taking API requests. The frontend uses Vite and React, and the backend uses DynamoDB as its data store. The backend also uses the Resend API to send password recovery emails. 

For CI/CD, a GitHub action builds and pushes a docker image to ECR, which triggers AWS App Runner to automatically deploy it.