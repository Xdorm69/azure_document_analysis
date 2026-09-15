import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol,
} from "@azure/storage-blob";

const accountName =
  process.env.AZURE_STORAGE_ACCOUNT_NAME;

const accountKey =
  process.env.AZURE_STORAGE_ACCOUNT_KEY;

const containerName =
  process.env.AZURE_STORAGE_CONTAINER_NAME;

if (!accountName) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_NAME is missing"
  );
}

if (!accountKey) {
  throw new Error(
    "AZURE_STORAGE_ACCOUNT_KEY is missing"
  );
}

if (!containerName) {
  throw new Error(
    "AZURE_STORAGE_CONTAINER_NAME is missing"
  );
}

const credential =
  new StorageSharedKeyCredential(
    accountName,
    accountKey
  );

const blobServiceClient =
  new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
  );

const containerClient =
  blobServiceClient.getContainerClient(
    containerName
  );

export async function uploadDocument(
  file: File,
  blobPath: string
) {
  const blobClient =
    containerClient.getBlockBlobClient(
      blobPath
    );

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  await blobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: file.type,
    },
  });

  return {
    blobPath,
    url: blobClient.url,
  };
}

export function generateBlobSasUrl(
  blobPath: string
) {
  const startsOn = new Date();

  const expiresOn = new Date(
    startsOn.getTime() + 10 * 60 * 1000
  );

  const sasToken =
    generateBlobSASQueryParameters(
      {
        containerName: containerName as string,
        blobName: blobPath,
        permissions: BlobSASPermissions.parse("r"),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      credential
    ).toString();

  const blobClient =
    containerClient.getBlobClient(blobPath);

  return `${blobClient.url}?${sasToken}`;
}