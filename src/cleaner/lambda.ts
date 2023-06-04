import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

import {rimfireCalibres,shotgunGauges, centerFireCalibres} from "ammobin-classifier"
import { ItemType } from "../graphql-types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const main = async () => {

    const keysToDelete = [
       ... rimfireCalibres.map(rc => `${ItemType.rimfire}_${rc[0]}`),
       ... centerFireCalibres.map(rc => `${ItemType.centerfire}_${rc[0]}`),
       ... shotgunGauges.map(rc => `${ItemType.shotgun}_${rc[0]}`),
       // todo reloads
    ]
    console.log(keysToDelete)

    const response = await Promise.allSettled(keysToDelete.map(id => docClient.send(new DeleteCommand({
        TableName: "ammobinItems",
        Key: {
            id,
        },
      }))))

  console.log(response, JSON.stringify(response));
  return response;
};

