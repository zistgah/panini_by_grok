rm MANIFEST.*
find . -type f | grep -v ".git/" | xargs git add
git commit -m "Updated ${1}"
find . -type f | grep -v ".git/" | xargs sha256sum > MANIFEST.sha256
misty ots stamp MANIFEST.sha256
git add MANIFEST.*
git commit -m "misty ots stamp"

