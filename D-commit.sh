sudo docker-compose -f docker-compose.dev.yml down
git add .
git commit -m "fix"
git checkout develop
git pull
git checkout dev/danh
git rebase develop
git push -f
yarn build
