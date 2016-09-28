'use strict';

const fs = require('fs'),
  path = require('path');

module.exports = class DotEnv {

  constructor(serverless) {
    this.serverless = serverless;
    this.hooks = {
      'before:deploy:function:deploy': () => this.writeEnvironmentFile(),
      'after:deploy:function:deploy': () => this.deleteEnvironmentFile(),
      'before:deploy:createDeploymentArtifacts': () => this.writeEnvironmentFile(),
      'after:deploy:createDeploymentArtifacts': () => this.deleteEnvironmentFile(),
    };
  }

  getEnvFilePath() {
    return path.join(this.serverless.config.servicePath, '.env');
  }

  getEnvString() {
    if (this.serverless.service.custom) {
      const dotenv = this.serverless.service.custom.dotenv || {};
      const values = [].concat(dotenv).reduce(function(memo, value) {
        if (typeof value === 'object') {
          return Object.assign(memo, value);
        }
        throw new Error('custom.environment must be an Object or Array')
      }, {});

      return Object.keys(values).reduce((memo, key) => {
        const val = values[key];

        if (typeof val === 'string') {
          return memo + `${key}=${val}\n`;
        }
        throw new Error(`custom.environment.${key}: must be a String`);
      }, '').trim();
    } else {
      return '';
    }
  }

  writeEnvironmentFile() {
    const filePath = this.getEnvFilePath();
    const str = this.getEnvString();

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, str, (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.serverless.cli.log(`Wrote .env file to ${filePath}`);
        resolve();
      });
    });
  }

  deleteEnvironmentFile() {
      const filePath = this.getEnvFilePath();

      return new Promise((resolve, reject) => {
        fs.stat(filePath, (err) => {
          if (err) {
            resolve();
            return;
          }

          fs.unlink(filePath, (err) => {
            if (err) {
              reject(err);
              return;
            }

            this.serverless.cli.log('Deleted .env file from ' + filePath);
            resolve();
          });
        });
      });
   }

};
