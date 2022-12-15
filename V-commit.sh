sudo docker-compose -f docker-compose.dev.yml down
git add .
git commit -m "Set isRealTest"
git checkout develop
git pull
git checkout dev/vietnq
git rebase develop
git push -f
yarn build
