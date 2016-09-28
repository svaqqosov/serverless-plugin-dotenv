# Serverless Plugin: DotEnv

## What is it?

Forked from https://github.com/silvermine/serverless-plugin-write-env-vars

This is a plugin for the Serverless framework (1.x branch, prior to 1.0.0
final) that writes environment variables out to a file that is compatible with
[dotenv](https://www.npmjs.com/package/dotenv).

Please monitor [Serverless #1455](https://github.com/serverless/serverless/issues/1455)
to determine if this plugin is still relevant.

## How do I use it?

Easy! In your `serverless.yml` file you add a custom variable that is a list of
variables you want written to an environment file. That file will be written
and bundled into the root of your code bundle. Then you can rely on the
[dotenv](https://www.npmjs.com/package/dotenv) library to load the file and
make those variables accessible to your running Lambda functions.

This makes it simple to take advantage of the powerful [variables
capabilities](https://github.com/serverless/serverless/blob/master/docs/01-guide/08-serverless-variables.md)
that are built into Serverless.

For example:

```yml
service: petstore-api

custom:
   projectName: petstore
   stage: ${opt:stage, env:USER}
   dotenv:
      SERVERLESS_STAGE: ${self:custom.stage}
      SERVERLESS_PROJECT: ${self:custom.projectName}
      SERVERLESS_SERVICE_NAME: ${self:service}

plugins:
   - serverless-plugin-dotenv
```

dotenv can also be an array:

```yml
custom:
   stage: ${opt:stage, env:USER}
   dotenv:
      - ${file:./env/${self:custom.stage}.yml}
      -
        SERVERLESS_STAGE: ${self:custom.stage}
```

That's all! Fill those variables up with any keys and values you want!

**NOTE:** at this time the plugin does absolutely no sanitization of keys or
values, so you should make sure they are simple strings that do not have line
breaks or other characters that would need to be escaped.

## License

This software is released under the MIT license. See [the license file](LICENSE) for more details.
