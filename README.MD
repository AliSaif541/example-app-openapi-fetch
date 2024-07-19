# Typesafe Client Generator

## Project Overview
This project  fetches the schema from Google Drive, converts it to TypeScript using `openapi-typescript`, and creates route functions for API requests using `openapi-fetch`. The project ensures that the correct schema is fetched based on the current branch and hash, reducing unnecessary fetches and uploads.

## Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)
3. [Schema Fetch Process](#schema-fetch-process)
4. [Branch-specific Schema Handling](#branch-specific-schema-handling)
5. [Schema Hashing](#schema-hashing)
6. [Interceptors](#interceptors)

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/AliSaif541/example-app-openapi-fetch.git
    cd example-app-openapi-fetch
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

## Usage
1. Create route functions to interact with the backend API.
2. Fetch the schema from Google Drive and convert it to Typescript interfaces:
    ```bash
    npm run fetch-swagger
    ```
3. Start the client
    ```bash
    npm run dev
    ```
4. Build the code:
    ```bash
    npm run build
    ```

## Schema Fetch Process
The `fetchingSchema.ts` script is available to fetch the `schema.json` from Google Drive. This script is executed before every commit or build using `husky`.

### Step-by-Step Process
1. **Fetch Schema from Google Drive**: Fetch the schema.json from Google Drive during commit or build using `husky`.
2. **Convert to TypeScript**: Convert the fetched schema to a TypeScript file using `openapi-typescript`.
3. **Build and Type Check**: Rebuild the code and check for type errors.

## Branch-specific Schema Handling
When multiple developers are working on different branches, it is important to fetch the correct schema corresponding to the specific branch. Thus, to ensure that the frontend is always in sync with the backend changes specific to the branch, avoiding potential conflicts and errors.

### Step-by-Step Process
1. **Specify Branch in Schema Fetch**: Include the branch name when fetching the schema file from Google Drive.
2. **Update Local Schema**: Save the fetched schema locally for use during the development process.

## Schema Hashing
Fetching and uploading the schema file every time code is committed or built can create unnecessary overhead. To optimize this process, we attach the md5 checksum of each file to its name and then compare the checksums to ensure that the schema is only fetched or uploaded when there are actual changes, reducing redundant operations.

### Step-by-Step Process
1. **Fetch Remote Hash**: Fetch the schema file name from Google Drive and extract the hash from the name.
2. **Compare Checksums**: Compare the local md5 checksum with the remote md5 checksum.
3. **Fetch Schema**: Fetch the schema only if the checksums are different.

## Interceptors
Interceptors allow you to manipulate requests and responses globally, which is useful for adding authentication tokens, logging, error handling, etc. 

Thus, to ensure that our project caters for interceptors, we created a sample authorization interceptor.

### Step-by-Step Process
1. **Create Interceptors**: Use the custom middleware setting of `openapi-fetch` to create interceptors.
2. **Authorization Token**: Add an authorization token to every request to ensure that all API requests are authenticated.
