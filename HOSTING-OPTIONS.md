# 24/7 Hosting Deployment Scripts

## GitHub Actions (Already Active)
# Your system automatically deploys on push!
git push origin main

## Railway Deployment
echo 'web: node --loader ts-node/esm src/mastra/services/production-trading-service.ts' > Procfile
echo 'PORT=3000' > .env
# Then: railway.app → Connect GitHub → Deploy

## Vercel (Dashboard Only)
npx vercel --prod
# Deploys docs/ folder as static site

## Digital Ocean
# After creating $6/month droplet:
ssh root@your-droplet-ip
git clone https://github.com/brettleehari/TweetBot.git
cd TweetBot
npm install
./trading-service.sh start

## Heroku
echo 'web: node --loader ts-node/esm src/mastra/services/production-trading-service.ts' > Procfile
heroku create your-app-name
git push heroku main

## Docker (Any Cloud)
# Add to Dockerfile:
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "--loader", "ts-node/esm", "src/mastra/services/production-trading-service.ts"]