#!/usr/bin/env sh

sed -i -e 's/interface /export interface /g' src/graphql-types.ts
sed -i -e 's/const /export const /g' src/graphql-types.ts
sed -i -e 's/declare namespace GQL {//g' src/graphql-types.ts
sed -i -e '/__typename/c\\t\t__typename: string | null' src/graphql-types.ts
sed -i -e 's/^}//g' src/graphql-types.ts
