1. Copy over the files from the report (ebola repo, `reports` branch)
into this directory:


```sh
export EBOLA_REPO=$( cd ~/github/nextstrain/ebola; pwd ) # update as needed
cp -r ${EBOLA_REPO}/reports/2026-11_bdbv/* .
rm -rf dist
```


2. From the `nextstrain.org` repo root:

```sh
bash scripts/build-gazette-blog.sh 
```

3. Start the server:

```sh
node server.js --verbose
```