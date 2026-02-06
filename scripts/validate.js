const Ajv = require('ajv');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schema/identity-spec.json'), 'utf8'));
const validate = ajv.compile(schema);

const exampleFiles = glob.sync(path.join(__dirname, '../examples/**/*.yaml'));
let hasErrors = false;

console.log(`🔍 Validating ${exampleFiles.length} specification(s)...\n`);

exampleFiles.forEach(file => {
    try {
        const doc = yaml.load(fs.readFileSync(file, 'utf8'));
        const valid = validate(doc);

        if (!valid) {
            console.error(`❌ ${path.relative(process.cwd(), file)}: INVALID`);
            validate.errors.forEach(err => {
                console.error(`   - ${err.instancePath} ${err.message}`);
                if (err.params && err.params.allowedValues) {
                    console.error(`     Allowed values: ${err.params.allowedValues.join(', ')}`);
                }
            });
            hasErrors = true;
        } else {
            console.log(`✅ ${path.relative(process.cwd(), file)}: VALID`);
        }
    } catch (e) {
        console.error(`💥 ${path.relative(process.cwd(), file)}: FAILED TO PARSE`);
        console.error(`   ${e.message}`);
        hasErrors = true;
    }
});

if (hasErrors) {
    console.error('\n🛑 Validation failed.');
    process.exit(1);
} else {
    console.log('\n✨ All specifications are valid.');
    process.exit(0);
}
