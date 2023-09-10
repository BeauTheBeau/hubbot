const { describe, test, expect, beforeEach} = require('@jest/globals');
const fs = require("fs");
const Logger = require("../src/functions/utilities/loggingUtils");

// Unit tests using Jest
describe('Logger', () => {
    let logger;

    beforeEach(() => {
        logger = new Logger();
    });

    test('should create a new instance of Logger', () => {
        expect(logger).toBeInstanceOf(Logger);
    });

    test('should log an INFO message to the console and file', () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        const fsAppendFileSpy = jest.spyOn(fs, 'appendFile').mockImplementation((path, data, callback) => {
            callback(null);
        });

        logger.log('Test INFO message');

        expect(consoleLogSpy).toHaveBeenCalled();
        expect(fsAppendFileSpy).toHaveBeenCalled();

        consoleLogSpy.mockRestore();
        fsAppendFileSpy.mockRestore();
    });

    test('should log a WARNING message to the console and file', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const fsAppendFileSpy = jest.spyOn(fs, 'appendFile').mockImplementation((path, data, callback) => {
            callback(null);
        });

        logger.warning('Test WARNING message');

        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(fsAppendFileSpy).toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
        fsAppendFileSpy.mockRestore();
    });

    test('should log an ERROR message to the console and file', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const fsAppendFileSpy = jest.spyOn(fs, 'appendFile').mockImplementation((path, data, callback) => {
            callback(null);
        });

        logger.error('Test ERROR message');

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(fsAppendFileSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
        fsAppendFileSpy.mockRestore();
    });
});
