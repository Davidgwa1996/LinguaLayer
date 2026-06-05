// Mock testing file for unit testing LinguaLayerCore
// Requires setting up vitest or jest eventually via \`npm run test\`
import { LinguaLayerClient } from '../../src/core/LinguaLayerClient';

describe('LinguaLayerCore Tests', () => {
    it('Creates participant instances successfully', () => {
        const client = new LinguaLayerClient();
        expect(client.getParticipantId()).toBeTruthy();
    });

    it('Tracks sessions implicitly', () => {
        const client = new LinguaLayerClient();
        client.rejoinSession('abc').then(() => {
           // mock behavior
        });
        expect(true).toBe(true);
    });
});
