TIME=$(date +%s.%N)
VER=$(expr $(ls ../*.zip | tr "_." "\n" | grep v | tr -d "v" | sort -u | tail -1) \+ 1)
mv ~/Downloads/panini.zip ../panini_by_grok_v${VER}.zip &&\
cd .. &&\
unzip panini_by_grok_v${VER}.zip &&\
cd panini_by_grok &&\
git checkout main &&\
cp -r ../panini_by_grok_v${VER}/panini/* ./ &&\
node tests/run.mjs &&\
node scripts/selfhost.mjs &&\
node scripts/prove_theorem.mjs &&\
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
git checkout -b stage6_beta_v${VER} &&\
git push --set-upstream origin stage6_beta_v${VER} &&\
git checkout main &&\
echo "Done :)" || echo "Failed. Sorry :("

