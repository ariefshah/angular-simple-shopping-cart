#!/bin/bash
# Empty the S3 bucket
aws s3 rm s3://www.standwithkashmir.org.au/shopping/ --recursive

# Upload our project files to the S3 bucket
aws s3 cp dist/ s3://www.standwithkashmir.org.au/shopping/ --recursive

aws cloudfront create-invalidation --distribution-id E2E8RFVSJXH6JE --paths "/*"
