const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Logger class for logging messages with timestamps to the console and a log file.
 */
class Logger {
    /**
     * Constructs a new Logger instance and ensures that the "logs" folder exists.
     */
    constructor() {
        /**
         * @private
         * @type {string} The current date in the format YYYY-MM-DD.
         */
        this.currentDate = new Date().toLocaleDateString().replace(/\//g, '-');

        /**
         * @private
         * @type {string} The current time in the format HH-MM-SS.
         */
        this.currentTime = new Date().toLocaleTimeString().replace(/:/g, '-');

        /**
         * @private
         * @type {string} The name of the log file.
         */
        this.logFileName = `${this.currentDate}_${this.currentTime}.log`;

        this.createLogsFolder();
    }

    /**
     * Ensures that the "logs" folder exists in the root directory of the project.
     * @private
     */
    createLogsFolder() {
        const logsFolderPath = path.join(__dirname, '../../../logs');
        if (!fs.existsSync(logsFolderPath)) {
            fs.mkdirSync(logsFolderPath);
        }
    }

    /**
     * Writes the logText to the log file.
     * @param {string} logText - The text to be written to the log file.
     * @private
     */
    writeToFile(logText) {
        const logPath = path.join(__dirname, '../../../logs', this.logFileName);
        fs.appendFile(logPath, logText + '\n', (err) => {
            if (err) console.error('Error writing to log file:', err);
        });
    }

    /**
     * Logs an INFO message to the console and file.
     * @param {string} message - The log message to be displayed.
     */
    log(message) {
        this.logMessage(message, 'INFO');
    }

    /**
     * Logs an ERROR message to the console and file.
     * @param {string} message - The error message to be displayed.
     */
    error(message) {
        this.logMessage(message, 'ERRX');
    }

    /**
     * Logs a WARNING message to the console and file.
     * @param {string} message - The warning message to be displayed.
     */
    warning(message) {
        this.logMessage(message, 'WARN');
    }

    /**
     * Logs messages with timestamp to the console and writes them to a log file.
     * @param {string} message - The log message to be displayed.
     * @param {string} [logLevel=INFO] - The log level. Possible values: "ERROR", "WARNING", "INFO".
     */
    logMessage(message, logLevel = 'INFO') {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] [${logLevel}] ${message}`;

        // Log to the console with different colors based on the log level
        switch (logLevel) {
            case 'ERROR':
                console.error(chalk.red(formattedMessage));
                break;
            case 'WARNING':
                console.warn(chalk.yellow(formattedMessage));
                break;
            case 'INFO':
                console.log(chalk.blue(formattedMessage));
                break;
            default:
                console.log(formattedMessage);
        }

        // Generate a log file name using the current date and time
        this.currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
        this.currentTime = new Date().toLocaleTimeString().replace(/:/g, '-');

        // Write to the log file
        this.writeToFile(formattedMessage);
    }
}

module.exports = { Logger };
