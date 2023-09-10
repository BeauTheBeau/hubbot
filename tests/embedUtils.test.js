const { describe, test, expect, beforeEach} = require('@jest/globals');
const fs = require("fs");
const EmbedUtils = require("../src/functions/utilities/embedUtils");

describe('EmbedUtils', () => {
    let loggerMock;
    let embedUtils;

    beforeEach(() => {
        loggerMock = {
            error: jest.fn(),
        };
        embedUtils = new EmbedUtils(loggerMock);
    });

    test('should create a new instance of EmbedUtils', () => {
        expect(embedUtils).toBeInstanceOf(EmbedUtils);
    });

    test('should log an error when sending an embed fails', async () => {
        const interactionMock = {};
        const error = new Error('Sending embed failed');

        // Simulate an error when sending an embed
        interactionMock.reply = jest.fn().mockRejectedValue(error);

        try {
            await embedUtils.sendEmbed(interactionMock, EmbedType.ERROR, 'Test Error', 'Error Message');
        } catch (err) {
            expect(loggerMock.error).toHaveBeenCalledWith(`Error sending embed: ${error.stack}`);
            expect(err).toBe(error);
        }
    });
});