const { Client } = require('pg');

async function testConnection() {
    const passwords = ['admin', 'postgres', 'password', '123456', ''];
    for (const pwd of passwords) {
        console.log(`Trying password: "${pwd}"`);
        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            password: pwd,
            port: 5432,
        });

        try {
            await client.connect();
            console.log(`SUCCESS! Password for "postgres" is "${pwd}"`);
            
            // Check if ppe_tracking exists
            const res = await client.query("SELECT 1 FROM pg_database WHERE datname='ppe_tracking'");
            if (res.rowCount === 0) {
                console.log("Database ppe_tracking does not exist. Creating...");
                await client.query("CREATE DATABASE ppe_tracking");
                console.log("Database ppe_tracking created.");
            } else {
                console.log("Database ppe_tracking already exists.");
            }
            
            await client.end();
            process.exit(0);
        } catch (err) {
            console.log(`Failed with password "${pwd}": ${err.message}`);
        }
    }
    console.log("All common passwords failed.");
    process.exit(1);
}

testConnection();
