import { Injectable } from "@nestjs/common";
import { config } from "../config/config";

const bcrypt = require('bcrypt');

@Injectable()
export class ClientHelper{
    async hashSecret(secret: string): Promise<string>{
        try {
            const hashSecret = await bcrypt.hash(secret, config.bcryptHashRound);
            return hashSecret;
        } catch (error) {
            throw new Error (`An error occured when hashing the secret ${error}`)
        }
    }
}