import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

export interface Config {
    hashSalt: string;
    pathToFiles: string;
    port: number;
    debugLogging: boolean;
    database: {
        nodes: string | string[];
        user: string;
        pwd: string;
    };
    cronJobExpression: string;
    cronJob: {
        watcherCustomerPassStatus: string;
    };
    vk: {
        clientId: string;
        secretKey: string;
        serviceKey: string;
    };
}

const domainShort = 'letschat.aituganov.site';
const domain = `https://${domainShort}`;
const apiPrefix = '/api';
const isDevMode = process.env.NODE_ENV == 'development';

const config: Config = {
    hashSalt: process.env.HASH_SALT || 'I am salt, motherfuckers!',
    pathToFiles: process.env.PATH_TO_FILES,
    port: +(process.env.PORT),
    debugLogging: isDevMode,
    database: {
        nodes: process.env.DATABASE_NODES.split(' '),
        user: process.env.DATABASE_USER,
        pwd: process.env.DATABASE_PWD,
    },
    cronJobExpression: '* * * * *',
    cronJob: {
        watcherCustomerPassStatus: '0 * * * *'
    },
    vk: {
        clientId: process.env.VK_APP_CLIENT_ID,
        secretKey: process.env.VK_APP_SECRET_KEY,
        serviceKey: process.env.VK_APP_SERVICE_KEY
    }
};

export { apiPrefix, config, domain, domainShort, isDevMode };
