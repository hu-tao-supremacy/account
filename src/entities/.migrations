ENTITIES=$(curl 'https://api.github.com/repos/hu-tao-supremacy/api-gateway/contents/src/entities' --silent | jq '.[]' | jq '.download_url' -r)
for e in $ENTITIES; do
  wget $e;
done
