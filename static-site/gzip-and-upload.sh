echo "GZipping build to s3/static/"
rm -r s3
mkdir s3
tar -czvf s3/static.tar.gz public

echo "Uploading to s3 nextstrain-bundles bucket"
aws s3 cp s3/ s3://nextstrain-bundles/ --recursive --region=us-east-1
