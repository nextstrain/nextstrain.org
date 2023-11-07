/**
 * S3 access with a more ergonomic API.
 *
 * @module s3
 */

import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  paginateListObjectsV2,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as aws from "./aws.js";
import { normalizeHeaders } from "./utils/index.js";

const client = new S3Client({...aws.clientConfig});


/**
 * List objects in an S3 bucket, optionally with a given prefix.
 *
 * @param {string} bucket - name of bucket
 * @param {string} [prefix] - object key prefix
 * @yields {{Key: string, ...}} see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-s3/Interface/_Object/}
 */
export async function* listObjects({bucket, prefix}) {
  const paginator = paginateListObjectsV2({client}, {
    Bucket: bucket,
    Prefix: prefix,
  });

  for await (const page of paginator) {
    yield* page.Contents ?? [];
  }
}


/**
 * Generate a signed URL for an S3 object.
 *
 * @param {object} params
 * @param {string} params.bucket - name of bucket
 * @param {string} params.key - object key
 * @param {string} [params.method] - HEAD, GET, PUT, DELETE. Default: GET
 * @param {object} [params.headers] - Content-Type and/or Content-Encoding headers for PUT
 * @param {number} [params.expiresIn] - seconds until the URL expires
 * @param {number} [params.issuedAt] - absolute time in seconds since the Unix epoch at which the signed URL should be considered issued at, i.e. when the countdown for expiresIn starts
 * @returns {string} signed URL
 */
export async function signedUrl({method="GET", bucket, key, headers={}, expiresIn, issuedAt}) {
  const normalizedHeaders = normalizeHeaders(headers);

  const commands = new Map([
    ["HEAD", () => new HeadObjectCommand({Bucket: bucket, Key: key})],
    ["GET",  () => new GetObjectCommand({Bucket: bucket, Key: key})],
    ["PUT",  () => new PutObjectCommand({
               Bucket: bucket,
               Key: key,
               ContentType: normalizedHeaders["content-type"],
               ContentEncoding: normalizedHeaders["content-encoding"],
             })],
    ["DELETE", () => new DeleteObjectCommand({Bucket: bucket, Key: key})],
  ]);

  const command = commands.get(method);
  if (!command) throw new Error(`Unsupported method: ${method}`);

  return await getSignedUrl(client, command(), { expiresIn, signingDate: issuedAt });
}
