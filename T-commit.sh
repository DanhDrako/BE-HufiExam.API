sudo docker-compose -f docker-compose.dev.yml down
git add .
git commit -m "Update price-gold api query province"
git checkout develop
git pull
git checkout dev/thang
git rebase develop
git push -f
yarn build
