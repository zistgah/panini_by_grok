TIME=$(date +%s.%N)
git checkout main &&\
cp -r ../panini_by_grok_v${1}/panini/* ./ &&\
mkdir -p attest/${TIME} &&\
mv MANIFEST.* attest/${TIME} &&\
find . -type f | grep -v ".git/" | xargs git add -f &&\
git commit -m "Updated stage 6 beta - v${1}" &&\
git push &&\
find . -type f | grep -v ".git/" | xargs sha256sum > MANIFEST.sha256 &&\
misty ots stamp MANIFEST.sha256 &&\
git add MANIFEST.* &&\
git commit -m "misty ots stamp @ ${TIME}" &&\
git push &&\
git checkout -b stage6_beta_v${1} &&\
git push --set-upstream origin stage6_beta_v${1} &&\
git checkout main &&\
echo "Done :)" || echo "Failed. Sorry :("

