'use strict';

const expect = require('expect.js'),
  sinon = require('sinon'),
  path = require('path'),
  os = require('os'),
  fs = require('fs'),
  Plugin = require('../index.js');

describe('serverless-plugin-write-env-consts', function() {

  describe('init', function() {

    it('registers the appropriate hook', function() {
      const plugin = new Plugin();

      expect(plugin.hooks['before:deploy:function:deploy']).to.be.a('function');
      expect(plugin.hooks['after:deploy:function:deploy']).to.be.a('function');
      expect(plugin.hooks['before:deploy:createDeploymentArtifacts']).to.be.a('function');
      expect(plugin.hooks['after:deploy:createDeploymentArtifacts']).to.be.a('function');
    });

    function testHookRegistration(hook, fn) {
      it('registers ' + hook + ' that calls ' + fn, function() {
        const plugin = new Plugin(),
          spy = sinon.stub(plugin, fn).returns(0);

        plugin.hooks[hook]();

        expect(spy.called).to.be.ok();
        expect(spy.calledOn(plugin));
      });
    }

    testHookRegistration('before:deploy:function:deploy', 'writeEnvironmentFile');
    testHookRegistration('after:deploy:function:deploy', 'deleteEnvironmentFile');
    testHookRegistration('before:deploy:createDeploymentArtifacts', 'writeEnvironmentFile');
    testHookRegistration('after:deploy:createDeploymentArtifacts', 'deleteEnvironmentFile');

  });


  describe('getEnvFilePath', () => {

    it('returns the correct path', function() {
      const plugin = new Plugin({
        config: {
          servicePath: '/tmp/foo'
        }
      });

      expect(plugin.getEnvFilePath()).to.eql(path.join('/tmp/foo', '.env'));
    });

  });

  describe('getEnvString', () => {
    it('returns the appropriate string with an object', function() {
      const plugin = new Plugin({
        service: {
          custom: {
            dotenv: {
              foo: 'bar'
            }
          }
        },
      });

      const str = plugin.getEnvString();

      expect(str).to.eql('foo=bar');
    });

    it('returns the appropriate string with an array', function() {
      const plugin = new Plugin({
        service: {
          custom: {
            dotenv: [{
              foo: 'bar'
            }, {
              beep: 'boop'
            }]
          }
        },
      });

      const str = plugin.getEnvString();

      expect(str).to.eql('foo=bar\nbeep=boop');
    });
  });

  describe('writeEnvironmentFile', () => {

    it('formats the output correctly and writes it to the correct place', () => {
      const tmpDir = os.tmpDir();
      const filePath = path.join(tmpDir, '.env'),
        plugin = new Plugin({
        config: {
          servicePath: tmpDir
        },
        service: {
          custom: {
            dotenv: {
              foo: 'bar'
            }
          }
        },
        cli: {
          log: Function.prototype
        },
      });

      return plugin.writeEnvironmentFile()
        .then(() => {
          fs.statSync(filePath);
        });
    });

  });

  describe('deleteEnvironmentFile', () => {

    function runTest(exists) {
      const tmpDir = os.tmpDir();
      const filePath = path.join(tmpDir, '.env'),
        plugin = new Plugin({
        config: {
          servicePath: tmpDir
        },
        service: {
          custom: {
            dotenv: {
              foo: 'bar'
            }
          }
        },
        cli: {
          log: Function.prototype
        },
      });

      if (exists) {
        fs.statSync(filePath);
      }

      return plugin.deleteEnvironmentFile()
        .then(() => {
          try {
            fs.statSync(filePath);
          } catch (e) {
            return;
          }
          throw new Error(`${filePath} should not exist`);
        });
    }

    it('invokes the proper functions - when file exists', () => {
      return runTest(true);
    });

    it('invokes the proper functions - when file does not exist', () => {
      return runTest(false);
    });

  });

});
