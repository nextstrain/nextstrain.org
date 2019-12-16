# Nextstrain Groups

Nextstrain Groups is the working name for the umbrella feature encompassing logins and private builds and eventually more features.
The historical design context and concrete needs the features arose from are summarized most recently [in Thomas' notes from early September 2019](https://github.com/tsibley/blab-standup/blob/master/2019-09-06.md).

## How-to

### Add a new user to an existing group

Login to the [Bedford Lab AWS Console](https://bedfordlab.signin.aws.amazon.com/console) with an IAM user that has permission to manage Cognito user pools.

Navigate to the [nextstrain.org Cognito user pool](https://console.aws.amazon.com/cognito/users/?region=us-east-1#/pool/us-east-1_Cg5rcTged/users).

Click the **Create user** button at the top.

Fill in a username; check **Send an invitation to this user?**; check **Email**.

Leave the temporary password blank to auto-generate one.

Leave the phone number field blank; uncheck **Mark phone number as verified**.

Fill in an email address; check **Mark email as verified**.

Click **Create user** button at the bottom.

Find new user in the list and click on their username.

Click **Add to group** button at the top.

Select group.

Click **Add to group** button at the bottom.


### On-board a new group

_This is a lot of steps, but in our early stages is a totally workable on-boarding process that can last us a while._
_The steps will also change and shift a bit as we improve integrations, so automating it now seems premature._

Add a new [source](glossary.md#source) class in [_nextstrain.org/auspice/server/sources.js_](https://github.com/nextstrain/nextstrain.org/blob/master/auspice/server/sources.js) based on the existing `InrbDrcSource` or `SeattleFluSource`.
The `_name` you give the source will be used in the nextstrain.org URL and by default as the Cognito group name and in the S3 bucket name.
For now, at least, names should be shorter than ~50 characters and only contain lowercase letters, numbers, and hyphens.
Commit this change but do not push yet.
You'll want to test it out locally as a final step.

Login to the [Bedford Lab AWS Console](https://bedfordlab.signin.aws.amazon.com/console) with an IAM user that has permission to manage Cognito user pools, IAM users/groups, and S3 buckets.

Navigate to the [nextstrain.org Cognito user pool](https://console.aws.amazon.com/cognito/users/?region=us-east-1#/pool/us-east-1_Cg5rcTged/users).

Create a new group with the name you gave the new group source above.
A description will help other teammates know what it is later.
Leave the **IAM role** and **precedence** blank.
(The IAM role and precedence will be filled in later when we start using Cognito Identity Pools.)

Add existing users the new group, or create new users in the group following [the how-to above](#add-a-new-user-to-an-existing-group).
Existing users will have to logout and login again for Nextstrain to recognize their new group membership.

Navigate to the [S3 console](https://s3.console.aws.amazon.com/s3/home?region=us-east-1).
Create a new bucket named `nextstrain-<group>` where `<group>` is replaced by the group source name you choose above.
Set the region to **US East (N. Virginia)** (`us-east-1`) for consistency with our other AWS resources.
If this bucket is for a private group, then leave the default policy of **Block _all_ public access**.
If the bucket is for a public group, you can disable the **Block _all_ public access** policy.

_Until we integrate Nextstrain (Cognito) users into `nextstrain deploy`, separate IAM users are necessary to upload datasets to the group S3 bucket._
_My suggestion in the short term is to limit these by sharing one IAM user for a group._

Navigate to the [IAM console](https://console.aws.amazon.com/iam/home?region=us-east-1#/home).

Create an IAM policy for the new S3 bucket allowing management of the objects inside.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "s3:ListBucket",
            "Resource": "arn:aws:s3:::nextstrain-<group>"
        },
        {
            "Sid": "VisualEditor1",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::nextstrain-<group>/*"
        }
    ]
}
```

Replace `<group>` with the group name.
Save the policy itself with a name like `AllowEditingOfNextstrain<group>Bucket`.

Create a new IAM group called `nextstrain-<group>`.
Attach the new policy you created above, as well as the `SeeCloudFrontDistributions` policy.

Create a new IAM user called `nextstrain-<group>`.
Enable **programmatic access** but _not_ **AWS Management Console access**.
Add the user to the group you just made above.
_Note that for groups internal to the lab, this is not strictly necessary, since lab members already have personal IAM users._
Copy the generated access credentials.
These will need to provided to the group owner.
If more then one individual Cognito user needs bucket management permissions, mint additional sets of access credentials from the IAM user page.
These access credentials need to be provided to `nextstrain deploy`, as documented in that command's help.

You also need to update the existing IAM policy [NextstrainDotOrgServerInstance](https://console.aws.amazon.com/iam/home?region=us-east-1#/policies/arn:aws:iam::827581582529:policy/NextstrainDotOrgServerInstance$jsonEditor) which grants read-only access to the bucket for the `nextstrain.org` IAM user.
This is the service user which the Nextstrain server itself uses to access the buckets of groups.

Add an entry like `arn:aws:s3:::nextstrain-<group>` to the `Resource` array of the policy statement allowing `s3:ListBucket`.

Add an entry like `arn:aws:s3:::nextstrain-<group>/*` to the `Resource` array of the policy statement allowing `s3:GetObject`.

Make sure to replace `<group>` with the group name.

For a public group, you'll also need to add a bucket policy allowing public read-only access to objects.
Under **Permissions** → **Bucket Policy**, add the following:

```json
{
    "Version": "2008-10-17",
    "Statement": [
        {
            "Sid": "PublicReadForGetBucketObjects",
            "Effect": "Allow",
            "Principal": {
                "AWS": "*"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::nextstrain-<group>/*"
        }
    ]
}
```

Replace `<group>` with the group name.

_The need to create new IAM groups, users, and policies for private buckets will go away once we integrate with Cognito Identity Pools._
