import { readFileSync } from "fs";

const PRODUCTION_CONFIG = "env/production/config.json";
const TESTING_CONFIG = "env/testing/config.json";
const RESOURCE_INDEX = "RESOURCE_INDEX";

const production_index = JSON.parse(readFileSync(PRODUCTION_CONFIG, 'utf8'))[RESOURCE_INDEX]
const testing_index = JSON.parse(readFileSync(TESTING_CONFIG, 'utf8'))[RESOURCE_INDEX]

if (production_index !== testing_index) {
    console.error(`ERROR: Please make sure ${PRODUCTION_CONFIG} and ${TESTING_CONFIG} have the same ${RESOURCE_INDEX}!"`)
    process.exit(1);
} else {
    console.log(`Confirmed ${PRODUCTION_CONFIG} and ${TESTING_CONFIG} have the same ${RESOURCE_INDEX}`);
    process.exit(0);
}
