/**
 * Newman Patterns Support - Index File
 * Imports and registers Newman-style patterns for Cypress
 */

// Import Newman-style runners
import NewmanStyleRunner from './newman-style-runner.js';
import PostmanCollectionRunner from './postman-collection-runner.js';

// Register as Cypress commands
Cypress.Commands.add('newmanRunner', () => {
    return new NewmanStyleRunner();
});

Cypress.Commands.add('postmanRunner', () => {
    return new PostmanCollectionRunner();
});

// Add to Cypress global
Cypress.Newman = {
    StyleRunner: NewmanStyleRunner,
    CollectionRunner: PostmanCollectionRunner
};

// Export for ES6 imports
export { NewmanStyleRunner, PostmanCollectionRunner };
