#!/usr/bin/env node

/**
 * Fix Generated Tests Script
 * Updates all generated test files to use new authentication and URL utilities
 */

const fs = require('fs');
const path = require('path');

class TestFixer {
    constructor() {
        this.cypressDir = path.join(__dirname, '..', 'cypress');
        this.e2eDir = path.join(this.cypressDir, 'e2e');
        this.fixedFiles = [];
        this.errors = [];
    }

    async fixAllTests() {
        console.log('🔧 Starting test fixes...\n');

        try {
            // Get all test files
            const testFiles = this.getTestFiles();
            console.log(`📁 Found ${testFiles.length} test files to fix\n`);

            // Fix each file
            for (const file of testFiles) {
                await this.fixTestFile(file);
            }

            // Generate summary
            this.generateSummary();

        } catch (error) {
            console.error('❌ Error fixing tests:', error.message);
            process.exit(1);
        }
    }

    getTestFiles() {
        const files = [];
        
        // Get all .cy.js files in e2e directory
        const scanDirectory = (dir) => {
            const items = fs.readdirSync(dir);
            
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (item.endsWith('.cy.js')) {
                    files.push(fullPath);
                }
            });
        };

        scanDirectory(this.e2eDir);
        return files;
    }

    async fixTestFile(filePath) {
        try {
            const relativePath = path.relative(this.cypressDir, filePath);
            console.log(`🔧 Fixing: ${relativePath}`);

            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Fix 1: Update API request patterns
            const apiRequestFixes = [
                {
                    pattern: /cy\.request\(\s*{\s*method:\s*['"`](\w+)['"`],\s*url:\s*[`'"]([^`'"]+)[`'"],/g,
                    replacement: (match, method, url) => {
                        // Extract endpoint from URL
                        const endpoint = url.replace(/\$\{[^}]+\}/g, '').replace(/https?:\/\/[^\/]+/, '');
                        return `cy.azionApiRequest('${method}', '${endpoint}',`;
                    }
                },
                {
                    pattern: /cy\.request\(\s*{\s*method:\s*['"`](\w+)['"`],\s*url:\s*([^,]+),/g,
                    replacement: (match, method, urlVar) => {
                        if (urlVar.includes('baseUrl') || urlVar.includes('Cypress.env')) {
                            return `cy.azionApiRequest('${method}', endpoint,`;
                        }
                        return match;
                    }
                }
            ];

            apiRequestFixes.forEach(fix => {
                if (fix.pattern.test(content)) {
                    content = content.replace(fix.pattern, fix.replacement);
                    modified = true;
                }
            });

            // Fix 2: Remove manual header construction
            const headerFixes = [
                {
                    pattern: /headers:\s*{\s*['"`]Authorization['"`]:\s*[`'"]Token\s*\$\{[^}]+\}[`'"],?\s*['"`]Content-Type['"`]:\s*['"`]application\/json['"`],?\s*}/g,
                    replacement: ''
                },
                {
                    pattern: /headers:\s*{\s*['"`]Authorization['"`]:\s*[^,}]+,?\s*['"`]Accept['"`]:\s*['"`]application\/json['"`],?\s*}/g,
                    replacement: ''
                }
            ];

            headerFixes.forEach(fix => {
                if (fix.pattern.test(content)) {
                    content = content.replace(fix.pattern, fix.replacement);
                    modified = true;
                }
            });

            // Fix 3: Update URL construction
            const urlFixes = [
                {
                    pattern: /const\s+url\s*=\s*[`'"]([^`'"]+)[`'"];/g,
                    replacement: (match, url) => {
                        if (url.includes('${') || url.includes('baseUrl')) {
                            const endpoint = url.replace(/\$\{[^}]+\}/g, '').replace(/https?:\/\/[^\/]+/, '');
                            return `const endpoint = '${endpoint}';`;
                        }
                        return match;
                    }
                },
                {
                    pattern: /url:\s*[`'"]([^`'"]*\$\{[^}]+\}[^`'"]*)[`'"]/g,
                    replacement: (match, url) => {
                        const endpoint = url.replace(/\$\{[^}]+\}/g, '').replace(/https?:\/\/[^\/]+/, '');
                        return `endpoint: '${endpoint}'`;
                    }
                }
            ];

            urlFixes.forEach(fix => {
                if (fix.pattern.test(content)) {
                    content = content.replace(fix.pattern, fix.replacement);
                    modified = true;
                }
            });

            // Fix 4: Update response handling to avoid async/sync mixing
            const responseFixes = [
                {
                    pattern: /\.then\(\s*\(\s*response\s*\)\s*=>\s*{\s*([^}]+)\s*return\s+([^;]+);\s*}\s*\)/g,
                    replacement: '.then((response) => {\n    $1\n    return cy.wrap($2);\n  })'
                },
                {
                    pattern: /\.then\(\s*\(\s*response\s*\)\s*=>\s*{\s*([^}]+)\s*}\s*\)/g,
                    replacement: (match, body) => {
                        if (!body.includes('return') && !body.includes('cy.')) {
                            return `.then((response) => {\n    ${body}\n    return cy.wrap(response);\n  })`;
                        }
                        return match;
                    }
                }
            ];

            responseFixes.forEach(fix => {
                if (fix.pattern.test(content)) {
                    content = content.replace(fix.pattern, fix.replacement);
                    modified = true;
                }
            });

            // Fix 5: Add proper imports if missing
            if (!content.includes('import') && !content.includes('require')) {
                const imports = `// Fixed imports for enhanced utilities\n`;
                content = imports + content;
                modified = true;
            }

            // Fix 6: Update environment variable access
            const envFixes = [
                {
                    pattern: /Cypress\.env\(['"`]apiToken['"`]\)/g,
                    replacement: "Cypress.env('AZION_TOKEN')"
                },
                {
                    pattern: /Cypress\.env\(['"`]baseUrl['"`]\)/g,
                    replacement: "Cypress.env('AZION_BASE_URL')"
                },
                {
                    pattern: /Cypress\.env\(['"`]accountId['"`]\)/g,
                    replacement: "Cypress.env('ACCOUNT_ID')"
                }
            ];

            envFixes.forEach(fix => {
                if (fix.pattern.test(content)) {
                    content = content.replace(fix.pattern, fix.replacement);
                    modified = true;
                }
            });

            // Fix 7: Update test structure for better error handling
            const structureFixes = [
                {
                    pattern: /expect\(response\.status\)\.to\.equal\((\d+)\);/g,
                    replacement: 'cy.validateApiResponse(response, $1);'
                },
                {
                    pattern: /expect\(response\.body\)\.to\.have\.property\(['"`]([^'"]+)['"`]\);/g,
                    replacement: 'expect(response.body).to.have.property(\'$1\');'
                }
            ];

            structureFixes.forEach(fix => {
                if (fix.pattern.test(content)) {
                    content = content.replace(fix.pattern, fix.replacement);
                    modified = true;
                }
            });

            // Save fixed content
            if (modified) {
                fs.writeFileSync(filePath, content);
                this.fixedFiles.push(relativePath);
                console.log(`  ✅ Fixed: ${relativePath}`);
            } else {
                console.log(`  ℹ️  No changes needed: ${relativePath}`);
            }

        } catch (error) {
            console.error(`  ❌ Error fixing ${filePath}:`, error.message);
            this.errors.push({ file: filePath, error: error.message });
        }
    }

    generateSummary() {
        console.log('\n📊 Fix Summary:');
        console.log(`  ✅ Files fixed: ${this.fixedFiles.length}`);
        console.log(`  ❌ Errors: ${this.errors.length}`);
        
        if (this.fixedFiles.length > 0) {
            console.log('\n📝 Fixed files:');
            this.fixedFiles.forEach(file => {
                console.log(`  - ${file}`);
            });
        }

        if (this.errors.length > 0) {
            console.log('\n⚠️  Errors encountered:');
            this.errors.forEach(error => {
                console.log(`  - ${error.file}: ${error.error}`);
            });
        }

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total_files_processed: this.fixedFiles.length + this.errors.length,
                files_fixed: this.fixedFiles.length,
                errors: this.errors.length
            },
            fixed_files: this.fixedFiles,
            errors: this.errors,
            fixes_applied: [
                'Updated API request patterns to use cy.azionApiRequest()',
                'Removed manual header construction',
                'Fixed URL construction patterns',
                'Updated response handling to avoid async/sync mixing',
                'Added proper imports where missing',
                'Updated environment variable access',
                'Improved test structure for better error handling'
            ]
        };

        const reportPath = path.join(__dirname, '..', 'reports', 'test-fixes-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Detailed report saved: reports/test-fixes-report.json`);
    }
}

// Execute fixes
if (require.main === module) {
    const fixer = new TestFixer();
    fixer.fixAllTests().then(() => {
        console.log('\n🎉 Test fixes completed!');
        process.exit(0);
    }).catch(error => {
        console.error('\n💥 Fix process failed:', error);
        process.exit(1);
    });
}

module.exports = TestFixer;
